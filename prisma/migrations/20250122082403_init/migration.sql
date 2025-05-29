/*
  Warnings:

  - You are about to drop the column `limitId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Limitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_limitId_fkey";

-- DropIndex
DROP INDEX "User_limitId_key";

-- AlterTable
ALTER TABLE "Limitation" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "limitId";

-- AddForeignKey
ALTER TABLE "Limitation" ADD CONSTRAINT "Limitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
