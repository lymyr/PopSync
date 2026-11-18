import type { Review } from "../../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.ts";

type args = 
    {
        type: "update";
        review: Review
    } |
    {
        type: "create";
        movieId: number | undefined;
        seriesId: number | undefined;
    }

export default function updateRatingSideEffect(userId: number, newRating: number, args: args) {
    if (args.type === "update" && args.review.rating === newRating)
        return
    
    let movieId: number | null | undefined
    let seriesId: number | null | undefined
    if (args.type == "update") {
        movieId = args.review.movieId;
        seriesId = args.review.seriesId
    }
    else {
        movieId = args.movieId
        seriesId = args.seriesId
    }

    if (typeof movieId == "number")
        return prisma.watchListMovie.update({
            where: {
                userId_movieId: {
                    userId,
                    movieId
                }
            },
            data: { rating: newRating }
        })
    else if (typeof seriesId == "number") {
        return prisma.watchListSeries.update({
            where: {
                userId_seriesId: {
                    userId,
                    seriesId
                }
            },
            data: { rating: newRating }
        })
    }
}