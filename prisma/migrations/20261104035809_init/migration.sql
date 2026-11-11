-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('makan', 'transport', 'kos', 'belanja', 'hiburan', 'lainnya');

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "nominal" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "catatan" VARCHAR(60) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);
