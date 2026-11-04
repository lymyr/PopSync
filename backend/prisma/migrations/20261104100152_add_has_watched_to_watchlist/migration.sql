-- AlterTable
ALTER TABLE "watchlist_movie" ADD COLUMN     "hasWatched" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "watchlist_series" ADD COLUMN     "hasWatched" BOOLEAN NOT NULL DEFAULT false;
