/*
  Warnings:

  - The primary key for the `watchlist_series` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movie_id` on the `watchlist_series` table. All the data in the column will be lost.
  - Added the required column `series_id` to the `watchlist_series` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_movie_id_fkey";

-- AlterTable
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_pkey",
DROP COLUMN "movie_id",
ADD COLUMN     "series_id" INTEGER NOT NULL,
ADD CONSTRAINT "watchlist_series_pkey" PRIMARY KEY ("user_id", "series_id");

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
