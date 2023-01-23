-- DropIndex
DROP INDEX `Book_photoUrl_key` ON `book`;

-- AlterTable
ALTER TABLE `book` MODIFY `photoUrl` LONGTEXT NOT NULL;
