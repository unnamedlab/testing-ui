/* ============================================================
   AXIOM — Users & roles (Administration)
   ============================================================ */

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
