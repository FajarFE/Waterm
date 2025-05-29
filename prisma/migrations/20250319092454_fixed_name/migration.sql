/*
  Warnings:

  - You are about to drop the column `maxTubidity` on the `Limitation` table. All the data in the column will be lost.
  - You are about to drop the column `minTubidity` on the `Limitation` table. All the data in the column will be lost.
  - Added the required column `maxTurbidity` to the `Limitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minTurbidity` to the `Limitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Limitation" DROP COLUMN "maxTubidity",
DROP COLUMN "minTubidity",
ADD COLUMN     "maxTurbidity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minTurbidity" DOUBLE PRECISION NOT NULL;
