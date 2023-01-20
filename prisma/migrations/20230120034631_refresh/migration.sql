/*
  Warnings:

  - Added the required column `userId` to the `ResetPassword` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `resetpassword` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `ResetPassword` ADD CONSTRAINT `ResetPassword_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
