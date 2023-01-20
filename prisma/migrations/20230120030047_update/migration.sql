/*
  Warnings:

  - Made the column `resetPasswordToken` on table `resetpassword` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resetPasswordExpired` on table `resetpassword` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `resetpassword` MODIFY `resetPasswordToken` VARCHAR(191) NOT NULL,
    MODIFY `resetPasswordExpired` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
