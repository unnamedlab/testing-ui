/* ============================================================
   AXIOM — Actions / write-back · data
   Targets reference real ontology objects (ENTITY_BY_ID).
   ============================================================ */

// effect kinds → icon + colour
export const EFFECT = {
  update:   { icon:"merge",    c:"var(--accent)", label:"Ontology update" },
  writeback:{ icon:"download", c:"var(--warn)",   label:"Write-back" },
  create:   { icon:"plus",     c:"var(--ok)",     label:"Creates object" },
  notify:   { icon:"bell",     c:"var(--info)",   label:"Notify" },
  approval: { icon:"shield",   c:"var(--violet)", label:"Control" },
};

export const ACTION_TYPES = {
  freeze: { name:"Freeze account", icon:"lock", color:"var(--alert)", cls:"SECRET",
    targets:["account"], approval:["Reviewer"], who:"Analysts · applied by a Reviewer",
    desc:"Block movement on an account and open a compliance case.",
    params:[
      { key:"scope", label:"Scope", type:"radio", options:["Full","Inbound","Outbound"], def:"Full" },
      { key:"reason", label:"Reason", type:"select", options:["Suspected layering","Sanctions match","Court order"], def:"Suspected layering" },
      { key:"note", label:"Note", type:"text", ph:"Add context for the reviewer…" },
    ],
    effects:[
      { kind:"update", text:"Set Account.status = Frozen on the ontology object" },
      { kind:"writeback", text:"Push freeze instruction to core-banking connector (SWIFT-GW)" },
      { kind:"create", text:"Open a Compliance Case linked to this object" },
      { kind:"notify", text:"Notify Compliance team and the assigned reviewer" },
    ] },
  watchlist: { name:"Add to watchlist", icon:"bookmark", color:"var(--accent)", cls:"CONFIDENTIAL",
    targets:["account","vessel","org","person"], approval:[], who:"Any analyst",
    desc:"Add the object to a watchlist and monitor for change.",
    params:[
      { key:"list", label:"Watchlist", type:"select", options:["High-risk vessels","Shell companies","Sanctioned-port callers"], def:"Shell companies" },
      { key:"alert", label:"Alert on change", type:"toggle", def:true },
    ],
    effects:[
      { kind:"update", text:"Add object to the selected watchlist" },
      { kind:"create", text:"Create a monitoring rule for change alerts" },
    ] },
  str: { name:"File STR", icon:"flag", color:"var(--warn)", cls:"SECRET",
    targets:["account","org"], approval:["Reviewer","Lead Analyst"], who:"Analysts · approved by Reviewer + Lead",
    desc:"File a Suspicious Transaction Report with the financial-intelligence unit.",
    params:[
      { key:"jur", label:"Jurisdiction", type:"select", options:["US FinCEN","EU FIU","UAE FIU"], def:"US FinCEN" },
      { key:"narrative", label:"Narrative", type:"text", ph:"Summary of suspicious activity…" },
    ],
    effects:[
      { kind:"create", text:"Generate STR document from case evidence" },
      { kind:"writeback", text:"Submit to FIU e-filing connector" },
      { kind:"update", text:"Mark related transactions as Reported" },
      { kind:"notify", text:"Notify Lead and Compliance" },
    ] },
  task: { name:"Task collection", icon:"target", color:"var(--violet)", cls:"SECRET",
    targets:["vessel","person"], approval:["Lead Analyst"], who:"Analysts · approved by Lead",
    desc:"Request intelligence collection against the object.",
    params:[
      { key:"sensor", label:"Sensor", type:"radio", options:["SAT","SIGINT","HUMINT"], def:"SAT" },
      { key:"priority", label:"Priority", type:"radio", options:["Routine","Priority","Immediate"], def:"Priority" },
      { key:"window", label:"Window", type:"select", options:["24h","72h","7d"], def:"72h" },
    ],
    effects:[
      { kind:"create", text:"Create a collection-request object" },
      { kind:"writeback", text:"Dispatch tasking to collection-management system" },
      { kind:"notify", text:"Notify the collection desk" },
    ] },
  designate: { name:"Designate entity", icon:"shield", color:"var(--alert)", cls:"SECRET",
    targets:["org","person","vessel"], approval:["Lead Analyst","Legal"], who:"Lead · co-approved by Legal",
    desc:"Add the entity to a sanctions program (two-person integrity).",
    params:[
      { key:"program", label:"Program", type:"select", options:["OFAC SDN","EU consolidated","UK OFSI"], def:"OFAC SDN" },
      { key:"effective", label:"Effective", type:"radio", options:["Immediately","Next day"], def:"Immediately" },
    ],
    effects:[
      { kind:"update", text:"Set classification marking + Designated flag" },
      { kind:"writeback", text:"Push to sanctions screening list (all sources)" },
      { kind:"create", text:"Generate designation notice (dossier)" },
      { kind:"notify", text:"Notify liaison partners" },
      { kind:"approval", text:"Two-person integrity required: Lead + Legal" },
    ] },
  ubo: { name:"Request UBO records", icon:"building", color:"var(--info)", cls:"CONFIDENTIAL",
    targets:["org"], approval:[], who:"Any analyst",
    desc:"Request beneficial-ownership records from a corporate registry.",
    params:[
      { key:"registry", label:"Registry", type:"select", options:["BVI FSC","Cyprus DRCOR","UAE"], def:"BVI FSC" },
      { key:"urgency", label:"Urgency", type:"radio", options:["Standard","Expedited"], def:"Standard" },
    ],
    effects:[
      { kind:"create", text:"Create a records-request object" },
      { kind:"writeback", text:"Send request to registry connector" },
    ] },
};

let _id = 100;
export const nextId = () => "ACT-" + (++_id);

// targets are real ontology object ids (ENTITY_BY_ID)
export const SEED_ACTIONS = [
  { id:"ACT-091", type:"freeze", target:"a-aurora-usd", by:"MC", approver:null, status:"pending", ts:"12m ago",
    just:"Pass-through layering hub — 87% of inbound flows route here. Recommend full freeze pending STR.", params:{ scope:"Full", reason:"Suspected layering" } },
  { id:"ACT-090", type:"task", target:"v-blackfrost", by:"AR", approver:null, status:"pending", ts:"40m ago",
    just:"Confirm cargo origin during the next Novorossiysk port call.", params:{ sensor:"SAT", priority:"Priority", window:"72h" } },
  { id:"ACT-088", type:"watchlist", target:"o-northwind", by:"JD", approver:"auto", status:"applied", ts:"2h ago", params:{ list:"Shell companies" } },
  { id:"ACT-087", type:"ubo", target:"o-helios", by:"MC", approver:"auto", status:"applied", ts:"3h ago", params:{ registry:"Cyprus DRCOR" } },
  { id:"ACT-085", type:"str", target:"a-aurora-usd", by:"AR", approver:"MC", status:"applied", ts:"1d ago", params:{ jur:"US FinCEN" } },
  { id:"ACT-082", type:"designate", target:"p-sorenson", by:"AR", approver:null, status:"rejected", ts:"2d ago",
    just:"Designate as UBO of the network.", note:"Returned by Legal — strengthen evidence of control first.", params:{ program:"OFAC SDN" } },
];

// R1: response automation rules moved to the unified rules engine.
// See src/data/data_rules.js (RULES with kind: "response"). This export
// was removed to end the two-engines / double-render duplication.
