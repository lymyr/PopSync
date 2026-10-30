/*
  Warnings:

  - The primary key for the `connection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `receiverId` on the `connection` table. All the data in the column will be lost.
  - Added the required column `receiver_id` to the `connection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "connection" DROP CONSTRAINT "connection_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "connection" DROP CONSTRAINT "connection_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "watch_group_user" DROP CONSTRAINT "watch_group_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_movie" DROP CONSTRAINT "watchlist_movie_userId_fkey";

-- DropForeignKey
ALTER TABLE "watchlist_series" DROP CONSTRAINT "watchlist_series_userId_fkey";

-- AlterTable
ALTER TABLE "connection" DROP CONSTRAINT "connection_pkey",
DROP COLUMN "receiverId",
ADD COLUMN     "receiver_id" INTEGER NOT NULL,
ADD CONSTRAINT "connection_pkey" PRIMARY KEY ("sender_id", "receiver_id");

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "comment_count" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_movie" ADD CONSTRAINT "watchlist_movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_group_user" ADD CONSTRAINT "watch_group_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;




ALTER TABLE "connection" ADD CONSTRAINT
  no_self_connection CHECK (receiver_id != sender_id);

ALTER TABLE review 
  ADD CONSTRAINT 
    no_negative_comment_count CHECK (comment_count >= 0),
  ADD CONSTRAINT
    no_negative_like_count CHECK (like_count >= 0);

ALTER TABLE comment ADD CONSTRAINT
  no_empty_comment CHECK (content != '');