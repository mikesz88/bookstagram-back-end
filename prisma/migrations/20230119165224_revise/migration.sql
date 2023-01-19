/*
  Warnings:

  - You are about to drop the column `forgotPasswordAnswer` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `forgotPasswordQuestion` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpired` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `forgotPasswordAnswer`,
    DROP COLUMN `forgotPasswordQuestion`,
    DROP COLUMN `password`,
    DROP COLUMN `resetPasswordExpired`,
    DROP COLUMN `resetPasswordToken`;

-- CreateTable
CREATE TABLE `Password` (
    `hash` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `Password_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForgotPassword` (
    `forgotPasswordQuestion` VARCHAR(191) NOT NULL,
    `forgotPasswordAnswer` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ForgotPassword_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResetPassword` (
    `resetPasswordToken` VARCHAR(191) NULL,
    `resetPasswordExpired` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ResetPassword_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Password` ADD CONSTRAINT `Password_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForgotPassword` ADD CONSTRAINT `ForgotPassword_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResetPassword` ADD CONSTRAINT `ResetPassword_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
