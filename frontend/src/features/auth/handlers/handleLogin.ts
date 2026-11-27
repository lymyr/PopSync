import type { NavigateFunction } from "react-router"
import type { User } from "../contexts/UserContext"

export default async function handleLogin(
    e: React.SubmitEvent<HTMLFormElement>,
    formData: object, 
    nav:NavigateFunction,
    setLoading: (value: React.SetStateAction<boolean>) => void,
    setError: (value: React.SetStateAction<string | undefined>) => void,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
) {
    setLoading(true)
    setError(undefined)
    e.preventDefault()
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/v1/users/authenticate`, {
            method: "post", 
            body: JSON.stringify(formData),
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        })
        if (res.status == 200) {
            const json = await res.json()
            setUser(json.data)
            localStorage.setItem("user", JSON.stringify(json.data))
            nav("/")
        }
        else if (res.status == 401) 
            setError("Invalid username or password")
    }
    catch(e) {
        if (e instanceof Error)
            setError(e.message)
        else
            setError("something went wrong")
    }
    finally {
        setLoading(false)
    }
}