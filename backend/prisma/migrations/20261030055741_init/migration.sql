-- CreateEnum
CREATE TYPE "connection_status" AS ENUM ('pending', 'accepted');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "description" TEXT,
    "pfp_path" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connection" (
    "sender_id" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUpdated" TIMESTAMP(3) NOT NULL,
    "status" "connection_status" NOT NULL DEFAULT 'pending',

    CONSTRAINT "connection_pkey" PRIMARY KEY ("sender_id","receiverId")
);

-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,
    "like_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "like" (
    "userId" INTEGER NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "like_pkey" PRIMARY KEY ("userId","reviewId")
);

-- CreateTable
CREATE TABLE "movie" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "poster_path" TEXT NOT NULL,
    "backdrop_path" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "vote_average" DECIMAL(4,3) NOT NULL,
    "runtime" INTEGER NOT NULL,

    CONSTRAINT "movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "poster_path" TEXT NOT NULL,
    "backdrop_path" TEXT NOT NULL,
    "first_air_date" TIMESTAMP(3) NOT NULL,
    "vote_average" DECIMAL(4,3) NOT NULL,
    "runtime" INTEGER NOT NULL,
    "seasons" JSONB NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist_movie" (
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "watchlist_movie_pkey" PRIMARY KEY ("userId","movieId")
);

-- CreateTable
CREATE TABLE "watchlist_series" (
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "watchlist_series_pkey" PRIMARY KEY ("userId","movieId")
);

-- CreateTable
CREATE TABLE "watch_group" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "watch_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_group_user" (
    "watch_group_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "watch_group_user_pkey" PRIMARY KEY ("watch_group_id","user_id")
);

-- CreateTable
CREATE TABLE "_MovieToWatchGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MovieToWatchGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SeriesToWatchGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SeriesToWatchGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "_MovieToWatchGroup_B_index" ON "_MovieToWatchGroup"("B");

-- CreateIndex
CREATE INDEX "_SeriesToWatchGroup_B_index" ON "_SeriesToWatchGroup"("B");

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_movie" ADD CONSTRAINT "watchlist_movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_movie" ADD CONSTRAINT "watchlist_movie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist_series" ADD CONSTRAINT "watchlist_series_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_group_user" ADD CONSTRAINT "watch_group_user_watch_group_id_fkey" FOREIGN KEY ("watch_group_id") REFERENCES "watch_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watch_group_user" ADD CONSTRAINT "watch_group_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToWatchGroup" ADD CONSTRAINT "_MovieToWatchGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToWatchGroup" ADD CONSTRAINT "_MovieToWatchGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "watch_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesToWatchGroup" ADD CONSTRAINT "_SeriesToWatchGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesToWatchGroup" ADD CONSTRAINT "_SeriesToWatchGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "watch_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
