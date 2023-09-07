/*
  Warnings:

  - You are about to drop the column `like` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "like";
ALTER TABLE "Message" ADD COLUMN     "likes" INT4 NOT NULL DEFAULT 0;
