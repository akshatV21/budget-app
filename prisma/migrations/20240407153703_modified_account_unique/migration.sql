/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,accountNo]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Account_name_accountNo_ownerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Account_ownerId_name_key" ON "Account"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_ownerId_accountNo_key" ON "Account"("ownerId", "accountNo");
