-- CreateEnum
CREATE TYPE "Interval" AS ENUM ('weekly', 'monthly', 'yearly');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interval" "Interval" NOT NULL DEFAULT 'monthly';
