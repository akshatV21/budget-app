-- CreateTable
CREATE TABLE "AccountStats" (
    "id" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "interval" "Interval" NOT NULL,
    "credited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountStats_from_to_interval_accountId_idx" ON "AccountStats"("from", "to", "interval", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountStats_from_to_interval_accountId_key" ON "AccountStats"("from", "to", "interval", "accountId");

-- AddForeignKey
ALTER TABLE "AccountStats" ADD CONSTRAINT "AccountStats_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
