/* AXIOM — data_evidence.js · fixture de demo regenerado
   Consumido por EvidenceView (DOCS). Tipos: pdf | image | csv.
   pdf.body: párrafos; cada segmento es string o [entId, surface].
   image.boxes: detecciones; csv.columns/rows: tabla. */
export const DOCS = [
  {
    id: "doc-registry", name: "northwind_registry.pdf", kind: "pdf", cls: "SECRET",
    sub: "Registro corporativo · BVI", title: "Northwind Holdings Ltd — Certificado de constitución",
    pages: "p. 1 / 14", source: "Corp. Registry API", ingested: "hace 1d", sha: "9f2a…c401", mono: false,
    entities: [
      { id: "o-northwind", name: "Northwind Holdings", type: "org", res: "matched", conf: 0.95 },
      { id: "p-sorenson", name: "Viktor Sørensen", type: "person", res: "matched", conf: 0.91 },
      { id: "o-castor", name: "Castor Corp Services", type: "org", res: "new", conf: 0.74 },
    ],
    body: [
      ["La sociedad ", ["o-northwind", "Northwind Holdings Ltd"], " se constituye en las Islas Vírgenes Británicas, con beneficiario último ", ["p-sorenson", "Viktor Sørensen"], "."],
      ["Agente formador: ", ["o-castor", "Castor Corp Services"], ". Capital social 50.000 USD. Director nominado sin poderes ejecutivos."],
    ],
  },
  {
    id: "doc-sat", name: "novoross_satellite.png", kind: "image", cls: "SECRET",
    sub: "Imagen satélite · terminal RUNVS", title: "Novorossiysk — atraque, 02 jun 2026",
    pages: "1 captura", source: "Sat Provider", ingested: "hace 5h", sha: "b71e…99af",
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
    sub: "SWIFT MT103 · abril", title: "Transferencias interbancarias — extracto",
    pages: "8.204 filas", source: "SWIFT feed", ingested: "hace 2d", sha: "1c0d…7720",
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
      ["Aurora USD", "Helios EUR", "4.820.000", "TXN-88241"],
      ["Helios EUR", "Northwind CHF", "3.100.000", "TXN-88290"],
      ["Aurora USD", "Northwind CHF", "2.200.000", "TXN-88312"],
    ],
  },
];
