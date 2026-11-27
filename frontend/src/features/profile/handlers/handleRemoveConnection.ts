import type { User } from "../../../contexts/UserContext"
import authFetch from "../../../utils/authFetch"
import type { ButtonState, ProfileState } from "../components/ProfileInfo"

export default async function handleCancelRequest(
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    profileState: ProfileState,
    setProfileState: React.Dispatch<React.SetStateAction<ProfileState>>,
    setButtonState: React.Dispatch<React.SetStateAction<ButtonState>>
) {
    if (profileState.data === null)
        throw new Error("profileState data is null")
    try {
        setButtonState({
            loading: true,
            error: null
        })
        const res = await authFetch(`/v1/connections/${profileState.data?.id}`, setUser, {method: "delete"})
        if (res.ok) {
            setProfileState({
                ...profileState,
                data: {
                    ...profileState.data,
                    connection: null
                }
            })
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