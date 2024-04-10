/*
  Warnings:

  - You are about to drop the column `cardNo` on the `Card` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,accountNo,ownerId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,number,ownerId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,email,phone,ownerId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_accountNo_key";

-- DropIndex
DROP INDEX "Account_name_key";

-- DropIndex
DROP INDEX "Card_cardNo_key";

-- DropIndex
DROP INDEX "Profile_name_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "cardNo",
ADD COLUMN     "number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_accountNo_ownerId_key" ON "Account"("name", "accountNo", "ownerId");

-- CreateIndex
CREATE INDEX "Card_number_idx" ON "Card"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_number_ownerId_key" ON "Card"("name", "number", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_email_phone_ownerId_key" ON "Profile"("name", "email", "phone", "ownerId");
