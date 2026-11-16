/*
  Warnings:

  - Added the required column `fallback_name` to the `watch_group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "watch_group" ADD COLUMN     "fallback_name" TEXT NOT NULL;
