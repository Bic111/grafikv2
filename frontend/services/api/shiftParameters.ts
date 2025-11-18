import { apiClient } from "./client";

export type ShiftParameter = {
  id: number;
  dzien_tygodnia: number; // 0-6 (Pon-Nie)
  typ_zmiany: string; // Rano | Środek | Popołudnie
  godzina_od: string; // HH:MM
  godzina_do: string; // HH:MM
  liczba_obsad?: number | null;
  czy_prowadzacy?: boolean;
};

export async function fetchShiftParameters(): Promise<ShiftParameter[]> {
  const res = await apiClient.get("/shift-parameters");
  return res.data as ShiftParameter[];
}
