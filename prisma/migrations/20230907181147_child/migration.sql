/*
  Warnings:

  - Added the required column `text` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "text" STRING NOT NULL;
