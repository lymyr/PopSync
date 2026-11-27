import { useContext, useEffect } from "react"
import type { SearchState } from "../pages/SearchResults"
import authFetch from "../../../features/auth/utils/authFetch"
import removeNullType from "../../../features/auth/utils/removeNullType"
import UserContext from "../../../features/auth/contexts/UserContext"
import { Link } from "react-router"
import styles from "./UserResults.module.css"

export interface UserSearchResult {
    type: "user";
    id: number;
    username: string;
    pfpPath: string;
}

type Props = {
    searchState: SearchState
    setSearchState: React.Dispatch<React.SetStateAction<SearchState>>
    searchQ: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function UserResults({
    searchState, 
    setSearchState,
    searchQ,
    setLoading,
    setError
}: Props) {
    const {setUser} = removeNullType(useContext(UserContext))

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true)
                setError(null)
                const searchParams = new URLSearchParams([
                    ["username", searchQ]
                ])
                if (searchState.lastUserId !== null)
                    searchParams.append("lastId", searchState.lastUserId.toString())
                const res = await authFetch(`/v1/users?${searchParams.toString()}`, setUser, {signal: controller.signal})
                if (res.ok) {
                    const json = await res.json() as {data: UserSearchResult[]}
                    setSearchState({
                        ...searchState,
                        // match this with 'take' within userController
                        canFetch: json.data.length < 10 ? false : true,
                        results: [
                            ...searchState.lastUserId !== null ? searchState.results : [], 
                            ...json.data.map(u => {return {...u, type: "user"}})
                        ] as UserSearchResult[]
                    })
                }
                else 
                    throw new Error("something went wrong")
                setLoading(false)
            }
            catch(e) {
                if (e instanceof Error && e.name != "AbortError")
                    setError(e.message)
                else if (!(e instanceof Error))
                    setError("something went wrong")
            }
        })();

        return () => controller.abort()

 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQ, searchState.lastUserId])

    return (
        <ul className={styles.container}>
            {
                searchState.results.map(u => {
                    if (u.type == "user")
                        return (
                            <li key={u.id}>
                                <Link to={`/profile/${u.id}`}>
                                    <div className={styles.profile}>
                                        <img 
                                            src={u.pfpPath ? u.pfpPath : undefined}
                                            alt="profile picture"
                                        />
                                        <p>{u.username}</p>
                                    </div>
                                </Link>
                            </li>
                        )
                })
            }
        </ul>
    )
}