/* AXIOM — ontology_schema.js · FUENTE ÚNICA de esquema (cluster ③)
   Antes el esquema estaba copiado literalmente en OntologyView.jsx
   (const SCHEMA) y OntologyAuthor.jsx (SEED_SCHEMA). Ahora vive aquí
   y lo importan Author (y vía re-export, Browse/Model/Views). */
export const OBJECT_SCHEMA = {
  person:  [["full_name","string","Indexed"],["dob","date",""],["nationality","string[]",""],["risk_score","number","Derived"],["aliases","string[]",""]],
  org:     [["legal_name","string","Indexed"],["incorporated","date",""],["jurisdiction","string",""],["beneficial_owner","→ Person","Link"],["status","enum",""]],
  vessel:  [["imo","string","Primary key"],["name","string","Indexed"],["flag","string",""],["dwt","number",""],["ais_gaps","number","Derived"],["operator","→ Organization","Link"]],
  port:    [["locode","string","Primary key"],["name","string",""],["country","string",""],["sanctions_exposure","enum","Derived"]],
  account: [["iban","string","Primary key"],["currency","enum",""],["holder","→ Organization","Link"],["volume_90d","number","Derived"]],
  txn:     [["txn_id","string","Primary key"],["amount","number",""],["currency","enum",""],["from_account","→ Account","Link"],["to_account","→ Account","Link"],["pattern","enum","ML"]],
  shipment:[["bl_number","string","Primary key"],["commodity","string",""],["origin","→ Facility","Link"],["destination","→ Facility","Link"]],
  device:  [["imei","string","Primary key"],["owner","→ Person","Link"],["last_seen","geo",""]],
};
