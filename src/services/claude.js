/* ============================================================
   AXIOM — Claude service abstraction
   ------------------------------------------------------------
   Aísla la dependencia del host (`window.claude`) que existe
   únicamente dentro del entorno de artifacts/builder. En una
   app standalone esa global no está presente, así que estas
   funciones degradan limpiamente: `isModelAvailable()` devuelve
   false y los componentes usan su camino de fallback.

   Para conectar un modelo real en producción, reemplaza el
   cuerpo de `complete()` por una llamada `fetch` a tu backend
   (que a su vez llame a la API de Anthropic con tu API key —
   nunca expongas la key en el cliente).
   ============================================================ */

// ¿Hay un proveedor de modelo inyectado por el host?
export function isModelAvailable() {
  return typeof window !== 'undefined' && typeof window.claude?.complete === 'function';
}

// Completa un prompt. Devuelve el texto del modelo, o `null` si
// no hay proveedor disponible (para que el llamador use su fallback).
export async function complete(prompt) {
  if (!isModelAvailable()) return null;
  try {
    const out = await window.claude.complete(prompt);
    return out || null;
  } catch {
    return null;
  }
}
