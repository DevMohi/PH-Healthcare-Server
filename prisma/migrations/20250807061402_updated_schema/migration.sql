/*
  Warnings:

  - The `hasPastSurgeries` column on the `patient_health_datas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recentAnxiety` column on the `patient_health_datas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recentDepression` column on the `patient_health_datas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "patient_health_datas" ALTER COLUMN "hasAllergies" DROP NOT NULL,
ALTER COLUMN "hasAllergies" SET DEFAULT false,
ALTER COLUMN "hasDiabetes" DROP NOT NULL,
ALTER COLUMN "hasDiabetes" SET DEFAULT false,
ALTER COLUMN "smokingStatus" DROP NOT NULL,
ALTER COLUMN "smokingStatus" SET DEFAULT false,
ALTER COLUMN "dietaryPreferences" DROP NOT NULL,
ALTER COLUMN "pregnancyStatus" DROP NOT NULL,
ALTER COLUMN "pregnancyStatus" SET DEFAULT false,
ALTER COLUMN "mentalHealthHistory" DROP NOT NULL,
ALTER COLUMN "immunizationStatus" DROP NOT NULL,
DROP COLUMN "hasPastSurgeries",
ADD COLUMN     "hasPastSurgeries" BOOLEAN DEFAULT false,
DROP COLUMN "recentAnxiety",
ADD COLUMN     "recentAnxiety" BOOLEAN DEFAULT false,
DROP COLUMN "recentDepression",
ADD COLUMN     "recentDepression" BOOLEAN DEFAULT false,
ALTER COLUMN "martialStatus" SET DEFAULT 'UNMARRIED';
