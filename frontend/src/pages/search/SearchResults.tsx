import { useLocation, useParams } from "react-router";
import HeaderSection from "../../components/HeaderSection";
import PageContainer from "../../components/PageContainer";
import { useEffect, useState } from "react";
import type { TmdbSearchResult } from "./components/TmdbResults";
import TmdbResults from "./components/TmdbResults";
import SectionText from "../../components/SectionText";
import type { SearchData } from "../../components/Header";
import UserResults, { type UserSearchResult } from "./components/UserResults";

export interface State {
    loading: boolean;
    error: string | null;
}

export type SearchState = {
    results: TmdbSearchResult[] | UserSearchResult[];
    canFetch: boolean;
    page: number;
    lastUserId: number | null;
}

export default function SearchResults() {
    const param = useParams()
    const typedFilter = param.filter as unknown as SearchData["filter"]
    const loc = useLocation()
    const searchQ = new URLSearchParams(loc.search).get("query")
    if (typeof searchQ != "string")
        throw new Error("search query is undefined")
    
    const headerText = typedFilter.split("").map((c, i) => {
        if (i == 0)
            return c.toUpperCase()
        return c
    }).join("")

    const [searchState, setSearchState] = useState<SearchState>({
        results: [],
        canFetch: true,
        lastUserId: null,
        page: 1
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        setSearchState({
            results: [],
            canFetch: true,
            lastUserId: null,
            page: 1
        })
    }, [loc.search, param.filter, typedFilter])

    return (
        <PageContainer pageTitle="Search Page">
            <HeaderSection title={`${headerText} Results`}>
                {
                    typedFilter != "users" ?
                        <TmdbResults
                            searchState={searchState}
                            setSearchState={setSearchState}
                            filter={typedFilter}
                            searchQ={searchQ}
                            setLoading={setLoading}
                            setError={setError}
                        />
                        :
                        <UserResults 
                            searchState={searchState}
                            setSearchState={setSearchState}
                            searchQ={searchQ}
                            setLoading={setLoading}
                            setError={setError}
                        />
                }
                {
                    error ? 
                        <SectionText text={error}/> :
                    loading ? 
                        <SectionText text={"Loading..."}/> :
                    searchState.canFetch && 
                        <button onClick={() => {
                            if (typedFilter != "users")
                                setSearchState({...searchState, page: searchState.page+1})
                            else
                                setSearchState({...searchState, lastUserId: searchState.results[searchState.results.length-1].id})
                        }}>
                            Load more results
                        </button>
                }
            </HeaderSection>
        </PageContainer>
    )
}