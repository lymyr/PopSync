import type { User } from "../../auth/contexts/UserContext"
import authFetch from "../../auth/utils/authFetch"
import type { OriginProps } from "../../../types/connection/OriginProps"
import type { LoadingErrorState } from "../../../types/LoadingErrorState"

export default async function handleRemoveConnection(
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    setButtonState: React.Dispatch<React.SetStateAction<LoadingErrorState>>,
    origin: OriginProps
) {
    try {
        setButtonState({
            loading: true,
            error: null
        })
        const res = await authFetch(
            origin.from == "profile" ?
                `/v1/connections/${origin.profileState.data?.id}` :
                `/v1/connections/${origin.userId}`, 
            setUser, 
            {method: "delete"}
        )
        if (res.ok && origin.from == "profile") {
            if (origin.profileState.data === null)
                throw new Error("profileState data is null")
            origin.setProfileState({
                ...origin.profileState,
                data: {
                    ...origin.profileState.data,
                    connection: null
                }
            })
        }
        else if (res.ok && origin.from == "connections") {
            origin.setConnections(origin.connections.filter(u => u.sender.id != origin.userId))
        }

        if (res.ok) {
            setButtonState({
                loading: false,
                error: null
            })
        }
        else {
            if (res.headers.get("content-type")?.includes("application/json")) {
                const json = await res.json()
                if (json.validationErrors?.id)
                    throw new Error(json.validationErrors.id.msg)
                else
                    throw new Error("something went wrong")
            }
        }
    }
    catch(e) {
        if (e instanceof Error)
            setButtonState({
                loading: false,
                error: e.message
            })
        else
            setButtonState({
                loading: false,
                error: "something went wrong"
            })
    }
}