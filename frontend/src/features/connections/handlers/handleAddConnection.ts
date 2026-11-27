import type { User } from "../../auth/contexts/UserContext";
import authFetch from "../../auth/utils/authFetch";
import type { OriginProps } from "../../../types/connection/OriginProps";
import type { LoadingErrorState } from "../../../types/LoadingErrorState";

export default async function handleAddConnection(
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
            {method: "post"}
        )
        if (origin.from == "profile") {
            if (origin.profileState.data === null)
                throw new Error("profileState data is null")
            if (origin.user == null)
                throw new Error("user is null")
            if (res.status == 201) {
                origin.setProfileState({
                    ...origin.profileState,
                    data: {
                        ...origin.profileState.data,
                        connection: {
                            senderId: origin.user.id,
                            receiverId: origin.profileState.data.id,
                            status: "pending",
                            dateAdded: new Date(),
                            dateUpdated: new Date()
                        }
                    }
                })
                setButtonState({
                    loading: false,
                    error: null
                })
            }
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