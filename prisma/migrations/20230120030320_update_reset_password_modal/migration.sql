/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordToken]` on the table `ResetPassword` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ResetPassword_resetPasswordToken_key` ON `ResetPassword`(`resetPasswordToken`);
