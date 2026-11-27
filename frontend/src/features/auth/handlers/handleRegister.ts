import type { NavigateFunction } from "react-router"
import type { RegisterError } from "../../../pages/auth/Register"

export default async function handleRegister(
    e: React.SubmitEvent<HTMLFormElement>,
    formData: object, 
    nav: NavigateFunction,
    setLoading: (value: React.SetStateAction<boolean>) => void,
    setError: (value: React.SetStateAction<RegisterError>) => void
) {
    e.preventDefault()
    setLoading(true)
    setError(undefined)
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/v1/users`, {
            method: "post", 
            body: JSON.stringify(formData),
            headers: {
                "content-type": "application/json"
            }
        })
        if (res.status == 201)
            nav("/login")
        else {
            if (res.headers.get("content-type")?.includes("application/json")) {
                const data = await res.json()
                if (data.validationErrors) {
                    setError(data.validationErrors)
                }
            }
            else if (res.statusText)
                setError(res.statusText)
        }
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