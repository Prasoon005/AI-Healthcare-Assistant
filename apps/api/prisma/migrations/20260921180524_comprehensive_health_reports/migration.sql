/*
  Warnings:

  - Added the required column `documentsSummary` to the `HealthReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followUpAnswers` to the `HealthReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicationsSummary` to the `HealthReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportContent` to the `HealthReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Existing rows (generated before this phase's rewrite) get empty-array/object
-- placeholders for the new fields rather than being dropped or backfilled
-- with invented content; new reports always populate them for real.
ALTER TABLE "HealthReport" ADD COLUMN     "documentsSummary" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "followUpAnswers" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "medicationsSummary" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "reportContent" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "HealthReport" ALTER COLUMN "documentsSummary" DROP DEFAULT,
ALTER COLUMN "followUpAnswers" DROP DEFAULT,
ALTER COLUMN "medicationsSummary" DROP DEFAULT,
ALTER COLUMN "reportContent" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ReportQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportQuestion_reportId_createdAt_idx" ON "ReportQuestion"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReportQuestion" ADD CONSTRAINT "ReportQuestion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "HealthReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
