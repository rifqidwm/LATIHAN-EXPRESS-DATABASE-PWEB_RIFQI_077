import type { Request, Response } from 'express';

// Tipe req.params untuk route yang memakai :id
type IdParams = { id: string };
import { prisma } from '../lib/prisma.js';
import type { Expense } from '../generated/prisma/client.js';
import { KATEGORI, type Kategori, type ExpenseResponse } from '../types/expense.js';

// Ubah baris database menjadi bentuk response (tanggal Date -> "YYYY-MM-DD")
function toResponse(expense: Expense): ExpenseResponse {
  return {
    id: expense.id,
    kategori: expense.kategori,
    nominal: expense.nominal,
    tanggal: expense.tanggal.toISOString().slice(0, 10),
    catatan: expense.catatan,
  };
}

// ID dari URL berupa teks, hanya bilangan bulat positif yang dianggap valid
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function notFoundMessage(id: string) {
  return { message: `Pengeluaran dengan id ${id} tidak ditemukan` };
}

// GET /api/expenses  (opsional: ?kategori=makan)
export async function getExpenses(req: Request, res: Response) {
  const { kategori } = req.query;

  if (typeof kategori === 'string' && kategori !== '' && !KATEGORI.includes(kategori as Kategori)) {
    res.status(200).json({ message: 'Berhasil mengambil data pengeluaran', data: [] });
    return;
  }

  const expenses = await prisma.expense.findMany({
    where: typeof kategori === 'string' && kategori !== '' ? { kategori: kategori as Kategori } : undefined,
    orderBy: [{ tanggal: 'desc' }, { id: 'desc' }],
  });

  res.status(200).json({ message: 'Berhasil mengambil data pengeluaran', data: expenses.map(toResponse) });
}

// GET /api/expenses/:id
export async function getExpenseById(req: Request<IdParams>, res: Response) {
  const id = parseId(req.params.id);
  const expense = id ? await prisma.expense.findUnique({ where: { id } }) : null;

  if (!expense) {
    res.status(404).json(notFoundMessage(req.params.id));
    return;
  }

  res.status(200).json({ message: 'Berhasil mengambil data pengeluaran', data: toResponse(expense) });
}

// POST /api/expenses
export async function createExpense(req: Request, res: Response) {
  const { kategori, nominal, tanggal, catatan } = req.body;

  const expense = await prisma.expense.create({
    data: {
      kategori,
      nominal,
      tanggal: new Date(tanggal),
      catatan: (catatan ?? '').trim(),
    },
  });

  res.status(201).json({ message: 'Pengeluaran berhasil ditambahkan', data: toResponse(expense) });
}

// PUT /api/expenses/:id
export async function updateExpense(req: Request<IdParams>, res: Response) {
  const id = parseId(req.params.id);
  const existing = id ? await prisma.expense.findUnique({ where: { id } }) : null;

  if (!id || !existing) {
    res.status(404).json(notFoundMessage(req.params.id));
    return;
  }

  const { kategori, nominal, tanggal, catatan } = req.body;
  const expense = await prisma.expense.update({
    where: { id },
    data: {
      kategori,
      nominal,
      tanggal: new Date(tanggal),
      catatan: (catatan ?? '').trim(),
    },
  });

  res.status(200).json({ message: 'Pengeluaran berhasil diperbarui', data: toResponse(expense) });
}

// DELETE /api/expenses/:id
export async function deleteExpense(req: Request<IdParams>, res: Response) {
  const id = parseId(req.params.id);
  const existing = id ? await prisma.expense.findUnique({ where: { id } }) : null;

  if (!id || !existing) {
    res.status(404).json(notFoundMessage(req.params.id));
    return;
  }

  const expense = await prisma.expense.delete({ where: { id } });
  res.status(200).json({ message: 'Pengeluaran berhasil dihapus', data: toResponse(expense) });
}
