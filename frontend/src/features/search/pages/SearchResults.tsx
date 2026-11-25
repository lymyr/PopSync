import { useLocation, useParams } from "react-router";
import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import { useState } from "react";

export type SearchResult = 
    {
        id: number;
        title: string;
        original_title: string;
        release_date: string;
        poster_path: string;
    } |
    {
        id: number;
        name: string;
        original_name: string;
        poster_path: string;
    }

export type State = {
    data: unknown[];
    loading: boolean;
    error: string | null;
}

export default function SearchResults() {
    const param = useParams()
    const filter = param.filter
    const headerText = filter?.split("").map((c, i) => {
        if (i == 0)
            return c.toUpperCase()
        return c
    }).join("")

    const loc = useLocation()
    const query = new URLSearchParams(loc.search).get("query")
    const [page, setPage] = useState(1)
    const [results, setResults] = useState<unknown[]>([])

    const [state, setState] = useState<State>({
        data: [],
        loading: false,
        error: null
    })

    return (
        <PageContainer pageTitle="Search Page">
            <HeaderSection title={`${headerText || ""} Results`}>
                {
                    // param.filter == "series" || param.filter == "movies" ?
                    //     <TmdbResults 
                    //         searchQ={query}
                    //         page={page}
                    //         type={param.filter}
                    //         results={results}
                    //         setResults={setResults}
                    //     />
                    //     :
                        <p>none</p>
                }
            </HeaderSection>
        </PageContainer>
    )
}