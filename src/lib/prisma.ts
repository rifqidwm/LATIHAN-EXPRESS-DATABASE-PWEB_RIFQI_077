import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi dengan connection string Neon.');
}

// Prisma 7 memakai driver adapter, koneksi ke Neon lewat driver pg
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
