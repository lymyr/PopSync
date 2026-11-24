import type { NavigateFunction } from "react-router";

export default async function customFetch(path: string, opts?: RequestInit, nav?:NavigateFunction ) {
    const link = import.meta.env.DEV ? import.meta.env.VITE_BACKEND_URL_DEV : import.meta.env.VITE_BACKEND_URL
    const res = await fetch(`${link}${path}`, {
        ...opts,
        headers: {
            "content-type": "application/json"
        }
    })
    if (res.status == 403 && nav)
        nav("/login")
    return res
}