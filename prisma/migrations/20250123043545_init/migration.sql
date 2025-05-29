/*
  Warnings:

  - Changed the type of `PHWater` on the `DataMonitoring` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `TemperatureWater` on the `DataMonitoring` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `TurbidityWater` on the `DataMonitoring` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DataMonitoring" DROP COLUMN "PHWater",
ADD COLUMN     "PHWater" DOUBLE PRECISION NOT NULL,
DROP COLUMN "TemperatureWater",
ADD COLUMN     "TemperatureWater" DOUBLE PRECISION NOT NULL,
DROP COLUMN "TurbidityWater",
ADD COLUMN     "TurbidityWater" DOUBLE PRECISION NOT NULL;
