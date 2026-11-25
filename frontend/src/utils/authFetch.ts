import type { User } from "../contexts/UserContext"

export default async function authFetch(
    path: string, 
    setUser:React.Dispatch<React.SetStateAction<User | null>>, 
    opts?: RequestInit,
    body?:string
) {
    const fetchOpts: RequestInit = body ? 
        {...opts, credentials: "include", body, headers: {"content-type": "application/json"}} : 
        {...opts, credentials: "include", headers: {"content-type": "application/json"}}

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${path}`, {
        ...fetchOpts
    })
    
    if (res.status == 401) {
        localStorage.removeItem("user")
        setUser(null)
    }
        
    return res
}