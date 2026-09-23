export type DestType = "google" | "instagram" | "url";

export type PrepStatus =
  | "qr_listo"
  | "nfc_pendiente"
  | "nfc_listo"
  | "lista_venta";

export interface CardData {
  code: string;
  localName: string;
  destType: DestType;
  destValue: string;
  destUrl: string;
  status: "libre" | "asignada";
  prepStatus?: PrepStatus;
  scans: number;
  createdAt: number;
  updatedAt: number;
}
