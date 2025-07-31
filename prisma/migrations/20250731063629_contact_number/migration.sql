/*
  Warnings:

  - Added the required column `contactNumber` to the `Doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctors" ADD COLUMN     "contactNumber" TEXT NOT NULL;
