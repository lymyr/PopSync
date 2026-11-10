/*
  Warnings:

  - Made the column `author_id` on table `review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_review_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_author_id_fkey";

-- AlterTable
ALTER TABLE "review" ALTER COLUMN "author_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
