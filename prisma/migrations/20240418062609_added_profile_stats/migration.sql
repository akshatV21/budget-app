-- CreateTable
CREATE TABLE "ProfileStats" (
    "id" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "interval" "Interval" NOT NULL,
    "credited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debited" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileStats_from_to_interval_profileId_idx" ON "ProfileStats"("from", "to", "interval", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileStats_from_to_interval_profileId_key" ON "ProfileStats"("from", "to", "interval", "profileId");

-- AddForeignKey
ALTER TABLE "ProfileStats" ADD CONSTRAINT "ProfileStats_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
