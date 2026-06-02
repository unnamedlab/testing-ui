/* ============================================================
   AXIOM — Data for watchlists, alert rules, geofences, users
   ============================================================ */

export const WATCHLISTS = [
  { id:"wl1", name:"Sanctioned-port callers", type:"vessel", count:18, fresh:2, owner:"JD", desc:"Vessels with calls at RUNVS / sanctioned terminals" },
  { id:"wl2", name:"BLACKFROST UBO network", type:"person", count:7, fresh:1, owner:"AR", desc:"People linked to Helios/Northwind ownership" },
  { id:"wl3", name:"High-velocity accounts", type:"account", count:34, fresh:5, owner:"MC", desc:"Accounts > $5M/30d with layering signals" },
  { id:"wl4", name:"Mass-formation shells", type:"org", count:61, fresh:0, owner:"AR", desc:"Entities formed by flagged registry agents" },
];
export const SAVED_SEARCHES = [
  { id:"ss1", name:"Vessels @ Novorossiysk · >$1M", results:1, lastRun:"8m", alerts:true },
  { id:"ss2", name:"Nominee directors ×3+ companies", results:14, lastRun:"2h", alerts:true },
  { id:"ss3", name:"Round-trip wires < €200K", results:23, lastRun:"1d", alerts:false },
  { id:"ss4", name:"AIS gaps > 6h in risk zones", results:9, lastRun:"34m", alerts:true },
];

export const ALERT_RULES = [
  { id:"r1", name:"Layering pattern", type:"Financial", enabled:true, sev:"critical", cond:"≥3 hops AND total > $1M within 72h", triggers:12, scope:"All accounts" },
  { id:"r2", name:"AIS signal loss", type:"Maritime", enabled:true, sev:"high", cond:"gap > 4h WHILE inside risk geofence", triggers:5, scope:"Watchlist vessels" },
  { id:"r3", name:"Sanctions list match", type:"Sanctions", enabled:true, sev:"critical", cond:"object matches OFAC/EU ≥ 90%", triggers:3, scope:"All objects" },
  { id:"r4", name:"Beneficial-owner concealment", type:"Corporate", enabled:false, sev:"high", cond:"≥4 nominee directors share agent", triggers:0, scope:"Organizations" },
  { id:"r5", name:"Manifest mismatch", type:"Logistics", enabled:true, sev:"medium", cond:"declared commodity ≠ customs class", triggers:7, scope:"Shipments" },
];
export const GEOFENCES = [
  { id:"g1", name:"Black Sea — sanctioned terminals", x:58, y:33, r:60, vessels:2, sev:"alert" },
  { id:"g2", name:"Strait of Hormuz watch", x:64, y:47, r:42, vessels:5, sev:"warn" },
];

export const USERS = [
  { id:"AR", name:"Ana Reyes",     role:"Lead Analyst",       clearance:"TS/SCI", status:"active",  last:"now" },
  { id:"MC", name:"Marcus Cho",    role:"Financial Analyst",  clearance:"SECRET", status:"active",  last:"12m" },
  { id:"JD", name:"Jamal Diallo",  role:"Maritime Analyst",   clearance:"SECRET", status:"active",  last:"1h" },
  { id:"SK", name:"Sofia Krause",  role:"Compliance Officer", clearance:"SECRET", status:"active",  last:"3h" },
  { id:"TN", name:"Tomas Novak",   role:"Data Engineer",      clearance:"CONFIDENTIAL", status:"active", last:"22m" },
  { id:"LP", name:"Liam Park",     role:"Liaison (partner)",  clearance:"CONFIDENTIAL", status:"suspended", last:"4d" },
];
export const ROLES = [
  { name:"Lead Analyst",       members:1, perms:["Read all","Write","Merge objects","Export dossier","Manage cases"] },
  { name:"Analyst",            members:2, perms:["Read assigned","Write","Comment","Run queries"] },
  { name:"Compliance Officer", members:1, perms:["Read all","Audit log","Export","No write"] },
  { name:"Data Engineer",      members:1, perms:["Pipelines","Sources","Schema","No case access"] },
  { name:"Liaison (partner)",  members:1, perms:["Read shared only","No export","Watermarked"] },
];
