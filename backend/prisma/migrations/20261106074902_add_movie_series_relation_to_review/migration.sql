/*
  Warnings:

  - Added the required column `rating` to the `review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_updated` to the `watchlist_movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_updated` to the `watchlist_series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "review" ADD COLUMN     "movie_id" INTEGER,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "series_id" INTEGER;

-- AlterTable
ALTER TABLE "watchlist_movie" ADD COLUMN     "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_updated" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "watchlist_series" ADD COLUMN     "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_updated" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE review ADD CONSTRAINT check_singular_review_media
  CHECK (
    (movie_id IS NULL AND series_id IS NOT NULL) OR
    (movie_id IS NOT NULL AND series_id IS NULL)
  );

ALTER TABLE review ADD CONSTRAINT check_valid_rating_value
  CHECK (0 <= rating AND rating <= 10)