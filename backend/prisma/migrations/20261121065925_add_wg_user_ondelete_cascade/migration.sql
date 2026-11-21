-- DropForeignKey
ALTER TABLE "watch_group_user" DROP CONSTRAINT "watch_group_user_watch_group_id_fkey";

-- AddForeignKey
ALTER TABLE "watch_group_user" ADD CONSTRAINT "watch_group_user_watch_group_id_fkey" FOREIGN KEY ("watch_group_id") REFERENCES "watch_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
