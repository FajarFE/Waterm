/*
  Warnings:

  - You are about to drop the column `otpResetPasswordVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpResetPasswordVerified";
