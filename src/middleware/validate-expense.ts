import type { Request, Response, NextFunction } from 'express';
import { KATEGORI } from '../types/expense.js';

const NOMINAL_MAKS = 100_000_000;

// Dipakai pada POST dan PUT, memeriksa isi req.body sebelum masuk controller.
export function validateExpense(req: Request, res: Response, next: NextFunction) {
  const { kategori, nominal, tanggal, catatan } = req.body ?? {};
  const errors: string[] = [];

  if (!KATEGORI.includes(kategori)) {
    errors.push(`kategori harus salah satu dari: ${KATEGORI.join(', ')}`);
  }
  if (typeof nominal !== 'number' || !Number.isInteger(nominal) || nominal <= 0 || nominal > NOMINAL_MAKS) {
    errors.push('nominal harus bilangan bulat antara 1 sampai 100000000');
  }
  if (typeof tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(tanggal))) {
    errors.push('tanggal harus berformat YYYY-MM-DD');
  }
  if (catatan !== undefined && (typeof catatan !== 'string' || catatan.length > 60)) {
    errors.push('catatan harus berupa teks maksimal 60 karakter');
  }

  if (errors.length > 0) {
    res.status(400).json({ message: 'Data tidak valid', errors });
    return;
  }

  next();
}
