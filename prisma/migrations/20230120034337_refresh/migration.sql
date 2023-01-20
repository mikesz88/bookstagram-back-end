/*
  Warnings:

  - You are about to drop the column `userId` on the `resetpassword` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `resetpassword` DROP FOREIGN KEY `ResetPassword_userId_fkey`;

-- AlterTable
ALTER TABLE `resetpassword` DROP COLUMN `userId`;
