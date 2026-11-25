import authFetch from "../../../utils/authFetch"
import type { User } from "../../../contexts/UserContext"

export default async function handleDeleteAccount(
    e: React.SubmitEvent<HTMLFormElement>,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
) {
    e.preventDefault()
    try {
        setError(null)
        setLoading(true)
        const data = await authFetch(`/v1/users`, setUser, { method: "delete" })
        if (!data.ok)
            throw new Error("account delete failed")
        setUser(null)
        localStorage.removeItem("user")
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