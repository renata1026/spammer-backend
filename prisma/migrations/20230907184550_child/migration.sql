/*
  Warnings:

  - You are about to drop the column `parentId` on the `Message` table. All the data in the column will be lost.
  - Made the column `parentId` on table `Child` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_parentId_fkey";

-- AlterTable
ALTER TABLE "Child" ALTER COLUMN "parentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "parentId";

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
