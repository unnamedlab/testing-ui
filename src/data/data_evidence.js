/* AXIOM — data_evidence.js · demo fixture (UX-01: English source).
   Consumed by EvidenceView (DOCS). Types: pdf | image | csv.
   pdf.body: paragraphs; each segment is a string or [entId, surface].
   image.boxes: detections; csv.columns/rows: table. */
export const DOCS = [
  {
    id: "doc-registry", name: "northwind_registry.pdf", kind: "pdf", cls: "SECRET",
    sub: "Corporate registry · BVI", title: "Northwind Holdings Ltd — Certificate of incorporation",
    pages: "p. 1 / 14", source: "Corp. Registry API", ingested: "1d ago", sha: "9f2a…c401", mono: false,
    entities: [
      { id: "o-northwind", name: "Northwind Holdings", type: "org", res: "matched", conf: 0.95 },
      { id: "p-sorenson", name: "Viktor Sørensen", type: "person", res: "matched", conf: 0.91 },
      { id: "o-castor", name: "Castor Corp Services", type: "org", res: "new", conf: 0.74 },
    ],
    body: [
      ["The company ", ["o-northwind", "Northwind Holdings Ltd"], " is incorporated in the British Virgin Islands, with ultimate beneficial owner ", ["p-sorenson", "Viktor Sørensen"], "."],
      ["Formation agent: ", ["o-castor", "Castor Corp Services"], ". Share capital USD 50,000. Nominee director with no executive powers."],
    ],
  },
  {
    id: "doc-sat", name: "novoross_satellite.png", kind: "image", cls: "SECRET",
    sub: "Satellite image · RUNVS terminal", title: "Novorossiysk — berthing, 02 Jun 2026",
    pages: "1 capture", source: "Sat Provider", ingested: "5h ago", sha: "b71e…99af",
    entities: [
      { id: "v-blackfrost", name: "MV Blackfrost", type: "vessel", res: "matched", conf: 0.88 },
      { id: "f-novoross", name: "Novorossiysk", type: "port", res: "matched", conf: 0.97 },
    ],
    boxes: [
      { id: "v-blackfrost", type: "vessel", x: 34, y: 40, w: 22, h: 16 },
      { id: "f-novoross", type: "port", x: 62, y: 30, w: 28, h: 40 },
    ],
  },
  {
    id: "doc-swift", name: "swift_mt103_apr.csv", kind: "csv", cls: "SECRET",
    sub: "SWIFT MT103 · April", title: "Interbank transfers — extract",
    pages: "8,204 rows", source: "SWIFT feed", ingested: "2d ago", sha: "1c0d…7720",
    entities: [
      { id: "a-aurora-usd", name: "Aurora USD", type: "account", res: "matched", conf: 0.93 },
      { id: "a-helios-eur", name: "Helios EUR", type: "account", res: "matched", conf: 0.9 },
    ],
    columns: [
      { name: "ordering", type: "account", map: "→ Account.from" },
      { name: "beneficiary", type: "account", map: "→ Account.to" },
      { name: "amount", type: null, map: "→ Txn.amount" },
      { name: "ref", type: null, map: "→ Txn.id" },
    ],
    rows: [
      ["Aurora USD", "Helios EUR", "4,820,000", "TXN-88241"],
      ["Helios EUR", "Northwind CHF", "3,100,000", "TXN-88290"],
      ["Aurora USD", "Northwind CHF", "2,200,000", "TXN-88312"],
    ],
  },
];
