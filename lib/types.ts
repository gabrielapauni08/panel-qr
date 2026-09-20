export type DestType = "google" | "instagram" | "url";

export interface CardData {
  code: string;
  localName: string;
  destType: DestType;
  destValue: string;
  destUrl: string;
  status: "libre" | "asignada";
  scans: number;
  createdAt: number;
  updatedAt: number;
}
