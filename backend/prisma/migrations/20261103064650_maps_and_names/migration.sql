/*
  Warnings:

  - You are about to drop the column `dateAdded` on the `connection` table. All the data in the column will be lost.
  - You are about to drop the column `dateUpdated` on the `connection` table. All the data in the column will be lost.
  - The primary key for the `like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reviewId` on the `like` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `like` table. All the data in the column will be lost.
  - The primary key for the `watchlist_movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movieId` on the `watchlist_movie` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `watchlist_movie` table. All the data in the column will be lost.
  - The primary key for the `watchlist_series` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movieId` on the `watchlist_series` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `watchlist_series` table. All the data in the column will be lost.
  - Added the required column `date_updated` to the `connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review_id` to the `like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movie_id` to the `watchlist_movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `watchlist_movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movie_id` to the `watchlist_series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `watchlist_series` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "like" DROP CONSTRAINT "like_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "like" DROP CONSTRAINT "like_userId_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_movie" DROP CONSTRAINT "watchlist_movie_movieId_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_movie" DROP CONSTRAINT "watchlist_movie_userId_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_movieId_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_userId_fkey";

-- AlterTable
ALTER TABLE "connection" DROP COLUMN "dateAdded",
DROP COLUMN "dateUpdated",
ADD COLUMN     "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_updated" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "like" DROP CONSTRAINT "like_pkey",
DROP COLUMN "reviewId",
DROP COLUMN "userId",
ADD COLUMN     "review_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "like_pkey" PRIMARY KEY ("user_id", "review_id");

-- AlterTable
ALTER TABLE "watchlist_movie" DROP CONSTRAINT "watchlist_movie_pkey",
DROP COLUMN "movieId",
DROP COLUMN "userId",
ADD COLUMN     "movie_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "watchlist_movie_pkey" PRIMARY KEY ("user_id", "movie_id");

-- AlterTable
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_pkey",
DROP COLUMN "movieId",
DROP COLUMN "userId",
ADD COLUMN     "movie_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "watchlist_series_pkey" PRIMARY KEY ("user_id", "movie_id");

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_movie" ADD CONSTRAINT "watchlist_movie_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_movie" ADD CONSTRAINT "watchlist_movie_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
