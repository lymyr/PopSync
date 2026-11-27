import authFetch from "../utils/authFetch";
import type { User } from "../contexts/UserContext";

export default async function handleLogout(
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
    setLoading(true)
    const res = await authFetch("/v1/users/authenticate", setUser, { method: "delete" })
    setLoading(false)
    if (!res.ok)
        return // todo: add toast in the future ig
    localStorage.removeItem("user")
    setUser(null)
}