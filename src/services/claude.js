/* ============================================================
   AXIOM — Claude service (browser-side, no backend)
   Consumed by components/Copilot.jsx: isModelAvailable() + complete().

   Two modes, resolved at call time:
     1. PROXY (recommended for anything real) — set VITE_CLAUDE_PROXY_URL to a
        server endpoint that holds the API key and forwards to Anthropic. The
        key never reaches the browser.
     2. DIRECT (demo / local only) — provide an API key via env or localStorage
        and call the Anthropic Messages API straight from the page using the
        `anthropic-dangerous-direct-browser-access` header. Anyone can read a
        key shipped to the browser; never use this for a real deployment.

   Config (localStorage overrides env, so a demo can set a key at runtime with
   no rebuild):
     VITE_CLAUDE_PROXY_URL    | localStorage "axiom.claude.proxy"
     VITE_ANTHROPIC_API_KEY   | localStorage "axiom.claude.key"
     VITE_CLAUDE_MODEL        | localStorage "axiom.claude.model"
   ============================================================ */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-opus-4-8';
const MAX_TOKENS = 512; // deliberately short — Copilot answers cap at ~90 words

// Stable, byte-identical across calls so the system block can be prompt-cached.
// Thinking is left off for latency, so we explicitly ask for a final answer only
// (Opus 4.8 otherwise tends to narrate its reasoning into the visible response).
const SYSTEM_PROMPT =
  'You are AXIOM, an intelligence-analysis copilot embedded in an investigations ' +
  'platform. Answer concisely and in an investigative tone. If you are not certain, ' +
  'say so rather than inventing specifics. Respond only with your final answer — no ' +
  'preamble, no exploratory reasoning, no meta-commentary about your process.';

function env(key) {
  try { return import.meta.env?.[key]; } catch { return undefined; }
}
function ls(key) {
  try { return localStorage.getItem(key) || undefined; } catch { return undefined; }
}

function proxyUrl() { return ls('axiom.claude.proxy') || env('VITE_CLAUDE_PROXY_URL'); }
function apiKey()   { return ls('axiom.claude.key')   || env('VITE_ANTHROPIC_API_KEY'); }
function model()    { return ls('axiom.claude.model') || env('VITE_CLAUDE_MODEL') || DEFAULT_MODEL; }

let warnedDirect = false;

// True when a model can actually be reached: a proxy is configured (key lives
// server-side) or a direct API key is present. Copilot calls this to choose
// between a live answer and the scripted demo fallback.
export function isModelAvailable() {
  return Boolean(proxyUrl() || apiKey());
}

// Single-shot completion. Returns the model's text, or throws on transport /
// API error so the caller can fall back. `prompt` is the full instruction string
// assembled by the caller; it goes in the user turn while the persona above stays
// in the cached system block.
export async function complete(prompt, opts = {}) {
  const proxy = proxyUrl();
  const key = apiKey();
  if (!proxy && !key) throw new Error('No Claude provider configured');

  const body = {
    model: opts.model || model(),
    max_tokens: opts.maxTokens || MAX_TOKENS,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: String(prompt) }],
  };

  const url = proxy || ANTHROPIC_URL;
  const headers = { 'content-type': 'application/json' };
  if (!proxy) {
    if (!warnedDirect) {
      warnedDirect = true;
      console.warn(
        '[AXIOM] Calling Anthropic directly from the browser with a client-side key. ' +
        'This exposes the key to anyone who loads the app — use VITE_CLAUDE_PROXY_URL ' +
        'with a server-side key for any real deployment.'
      );
    }
    headers['x-api-key'] = key;
    headers['anthropic-version'] = ANTHROPIC_VERSION;
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  let res;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: opts.signal });
  } catch (e) {
    throw new Error('Claude request failed: ' + (e?.message || 'network error'));
  }

  if (!res.ok) {
    let detail = '';
    try { const j = await res.json(); detail = j?.error?.message || JSON.stringify(j); }
    catch { detail = await res.text().catch(() => ''); }
    throw new Error(`Claude API ${res.status}: ${detail || res.statusText}`);
  }

  const data = await res.json().catch(() => null);
  if (!data) return '';
  // Messages API → content is an array of blocks; concatenate the text ones.
  // A custom proxy may instead return a raw string or { text } — accept both.
  if (typeof data === 'string') return data;
  if (typeof data.text === 'string') return data.text;
  const blocks = Array.isArray(data.content) ? data.content : [];
  return blocks.filter((b) => b && b.type === 'text').map((b) => b.text).join('').trim();
}
