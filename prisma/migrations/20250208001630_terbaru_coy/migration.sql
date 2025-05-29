/*
  Warnings:

  - Added the required column `locationDevices` to the `Monitoring` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monitoring" ADD COLUMN     "locationDevices" TEXT NOT NULL;
