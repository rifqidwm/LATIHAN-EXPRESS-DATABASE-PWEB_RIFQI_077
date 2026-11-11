import { Kategori } from '../generated/prisma/enums.js';

// Daftar kategori diambil dari enum di prisma/schema.prisma
export const KATEGORI = Object.values(Kategori);

export type { Kategori };

// Bentuk data yang dikirim ke client (tanggal sebagai teks YYYY-MM-DD)
export interface ExpenseResponse {
  id: number;
  kategori: Kategori;
  nominal: number;
  tanggal: string;
  catatan: string;
}
