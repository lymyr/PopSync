-- AlterTable
ALTER TABLE "watchlist_movie" ADD COLUMN     "rating" INTEGER;

-- AlterTable
ALTER TABLE "watchlist_series" ADD COLUMN     "rating" INTEGER;


ALTER TABLE watchlist_movie 
    ADD CONSTRAINT check_valid_rating_value CHECK ((0 <= rating AND rating <= 10) OR rating IS NULL);

ALTER TABLE watchlist_series
    ADD CONSTRAINT check_valid_rating_value CHECK ((0 <= rating AND rating <= 10) OR rating IS NULL);