import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import customFetch from "../utils/customFetch";

export default function useFetch(path: string) {
    const nav = useNavigate()
    const [data, setData] = useState()
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            setLoading(true)
            setError(undefined)
            const res = await customFetch(path, {signal: controller.signal}, nav)
            if (res.headers.get("Content-Type")?.includes("application/json")) {
                const json = await res.json()
                if (res.ok) 
                    setData(json)
                else
                    setError(json)
            }
            setLoading(false)
        })();

        return () => controller.abort()

    }, [path, nav])

    return {data, error, loading}
}