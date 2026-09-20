-- CreateTable
CREATE TABLE "HealthAnalysis" (
    "id" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "additionalContext" TEXT,
    "profileSnapshot" JSONB,
    "aiResult" JSONB NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthAnalysis_userId_createdAt_idx" ON "HealthAnalysis"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "HealthAnalysis" ADD CONSTRAINT "HealthAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
