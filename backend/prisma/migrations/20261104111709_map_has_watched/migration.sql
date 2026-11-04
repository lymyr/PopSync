/*
  Warnings:

  - You are about to drop the column `hasWatched` on the `watchlist_movie` table. All the data in the column will be lost.
  - You are about to drop the column `hasWatched` on the `watchlist_series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "watchlist_movie" DROP COLUMN "hasWatched",
ADD COLUMN     "has_watched" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "watchlist_series" DROP COLUMN "hasWatched",
ADD COLUMN     "has_watched" BOOLEAN NOT NULL DEFAULT false;
