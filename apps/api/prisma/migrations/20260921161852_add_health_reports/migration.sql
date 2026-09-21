-- CreateTable
CREATE TABLE "HealthReport" (
    "id" TEXT NOT NULL,
    "rangeKey" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "profileSnapshot" JSONB,
    "vitalsSummary" JSONB NOT NULL,
    "wellnessSnapshot" JSONB NOT NULL,
    "analysesSummary" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthReport_userId_createdAt_idx" ON "HealthReport"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "HealthReport" ADD CONSTRAINT "HealthReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
