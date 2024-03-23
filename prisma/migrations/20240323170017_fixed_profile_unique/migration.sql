/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Profile_name_email_phone_ownerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_ownerId_key" ON "Profile"("name", "ownerId");
