/*
  Warnings:

  - You are about to drop the column `runtime` on the `series` table. All the data in the column will be lost.
  - Added the required column `status` to the `series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "series" DROP COLUMN "runtime",
ADD COLUMN     "status" TEXT NOT NULL;