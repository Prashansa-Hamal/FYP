/*
  Warnings:

  - Made the column `loyalityPoints` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "loyalityPoints" SET NOT NULL,
ALTER COLUMN "loyalityPoints" SET DEFAULT 0;
