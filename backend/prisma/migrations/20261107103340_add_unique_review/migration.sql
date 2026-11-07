/*
  Warnings:

  - A unique constraint covering the columns `[author_id,movie_id]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[author_id,series_id]` on the table `review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "review_author_id_movie_id_key" ON "review"("author_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_author_id_series_id_key" ON "review"("author_id", "series_id");
