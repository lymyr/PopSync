import type React from "react";
import { useContext, useEffect } from "react";
import authFetch from "../../../features/auth/utils/authFetch";
import removeNullType from "../../../features/auth/utils/removeNullType";
import UserContext from "../../../features/auth/contexts/UserContext";
import type { SearchState } from "../pages/SearchResults";
import styles from "./TmdbResults.module.css"
import { Link } from "react-router";

interface CommonTmdb {
    id: number;
    poster_path: string;
    backdrop_path: string;
}

interface TmdbMovieSearchResult extends CommonTmdb {
    type: "movie";
    title: string;
    original_title: string;
    release_date: string;
}

interface TmdbSeriesSearchResult extends CommonTmdb {
    type: "series";
    name: string;
    original_name: string;
    first_air_date: string;
}

export type TmdbSearchResult = TmdbMovieSearchResult | TmdbSeriesSearchResult

type Props = {
    searchState: SearchState
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>
    filter: "movies" | "series"
    searchQ: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function TmdbResults({
    searchState, 
    setSearchState,
    filter,
    searchQ,
    setLoading,
    setError
}: Props) {
    const {setUser} = removeNullType(useContext(UserContext))

    useEffect(() => {
        const searchParams = new URLSearchParams([
            ["query", searchQ],
            ["page", searchState.page.toString()],
            ["type", filter],
        ])
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const res = await authFetch(
                    `/v1/media?${searchParams.toString()}`, 
                    setUser, 
                    {signal: controller.signal}
                )
                if (res.ok) {
                    const json = await res.json() as {data: {results: TmdbSearchResult[]}}
                    setSearchState({
                        ...searchState,
                        results: [
                            ...searchState.page > 1 ? searchState.results : [], 
                            ...json.data.results.map(r => {
                                if (filter == "movies")
                                    return {...r, type: "movie"} as TmdbMovieSearchResult
                                return {...r, type: "series"} as TmdbSeriesSearchResult
                            })
                        ] as TmdbSearchResult[],
                        canFetch: !(json.data.results.length < 20),
                    })
                }
                else
                    throw new Error("something went wrong")
                /* 
                    CAUTION: havent tested this thoroughly 

                    why setLoading here instead of putting it in finally? 
                    while loading and user navigates somewhere else, 
                    setLoading will be false even tho a brand new fetch is currently ongoing

                    this should be okay (i think) since error is the first condition before checking if state is loading
                */
                setLoading(false)
            }
            catch(e) {
                if (e instanceof Error && e.name != "AbortError") 
                    setError(e.message)
                else if (!(e instanceof Error))
                    setError("something went wrong")
            }
        })();

        return () => controller.abort()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQ, filter, searchState.page])

    return (
        <ul className={styles.container}>
            {
                // todo: optimize image by using srcset
                // todo: add media details page
                searchState.results.map((r) => {
                    if (r.type == "movie")
                        return (
                            <li key={r.id} className={styles.mediaItem}>
                                <Link to={`/movies/${r.id}`}>
                                    <img 
                                        src={r.poster_path ? `https://image.tmdb.org/t/p/w500/${r.poster_path}` : undefined}
                                        alt="movie poster"
                                    />
                                    <p>{r.title} - {r.release_date}</p>
                                </Link>
                            </li>
                        )
                    else if (r.type == "series")
                        return (
                            <li key={r.id} className={styles.mediaItem}>
                                <Link to={`/series/${r.id}`}>
                                    <img 
                                        src={r.poster_path ? `https://image.tmdb.org/t/p/w500/${r.poster_path}` : undefined} 
                                        alt="series poster"
                                    />
                                    <p>{r.name} - {r.first_air_date}</p>
                                </Link>
                                
                            </li>
                        )
                })
            }
        </ul>
    )
}