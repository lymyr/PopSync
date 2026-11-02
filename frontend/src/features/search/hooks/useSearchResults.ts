import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function useSearchResults() {
    const [results, setResults] = useState([])
    const params = useParams()
    useEffect(() => {
        
    }, [])

    return { results }
}