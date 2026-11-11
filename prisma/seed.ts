import { prisma } from '../src/lib/prisma.js';

const data = [
  { kategori: 'kos', nominal: 850000, tanggal: '2026-11-01', catatan: 'Bayar kos bulan November' },
  { kategori: 'makan', nominal: 15000, tanggal: '2026-11-01', catatan: 'Nasi pecel depan kampus' },
  { kategori: 'transport', nominal: 25000, tanggal: '2026-11-02', catatan: 'Isi bensin motor' },
  { kategori: 'belanja', nominal: 42000, tanggal: '2026-11-02', catatan: 'Sabun, sampo, dan deterjen' },
  { kategori: 'hiburan', nominal: 35000, tanggal: '2026-11-03', catatan: 'Nonton bareng anak kos' },
] as const;

async function main() {
  // Kosongkan tabel dan reset ID ke 1 supaya request Postman (id 1, 2, 3) selalu valid
  await prisma.$executeRaw`TRUNCATE TABLE "expenses" RESTART IDENTITY`;

  await prisma.expense.createMany({
    data: data.map((item) => ({ ...item, tanggal: new Date(item.tanggal) })),
  });

  console.log(`Seed selesai, ${data.length} data pengeluaran ditambahkan.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
