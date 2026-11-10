-- DropForeignKey
ALTER TABLE "like" DROP CONSTRAINT "like_review_id_fkey";

-- AddForeignKey
ALTER TABLE "like" ADD CONSTRAINT "like_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
