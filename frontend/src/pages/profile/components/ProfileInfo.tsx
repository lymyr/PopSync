import { useContext, useEffect, useState } from "react"
import removeNullType from "../../../features/auth/utils/removeNullType"
import EditProfileDialog from "./EditProfileDialog"
import styles from "./ProfileInfo.module.css"
import UserContext from "../../../features/auth/contexts/UserContext"
import authFetch from "../../../features/auth/utils/authFetch"
import SectionText from "../../../components/SectionText"
import handleAddConnection from "../../../features/connections/handlers/handleAddConnection"
import handleRemoveConnection from "../../../features/connections/handlers/handleRemoveConnection"
import handleAcceptRequest from "../../../features/connections/handlers/handleAcceptRequest"
import type { LoadingErrorState } from "../../../types/LoadingErrorState"

interface Profile {
    id: number;
    username: string;
    description: string;
    pfpPath: string;
    isGuest: boolean;
    connection: 
        {
            senderId: number;
            receiverId: number;
            status: "pending" | "accepted";
            dateAdded: Date;
            dateUpdated: Date;
        } | 
        null
}

export interface ProfileState {
    data: Profile | null;
    loading: boolean;
    error: null | string;
}

export default function ProfileInfo({userId} : {userId: number | string}) {
    const {user, setUser} = removeNullType(useContext(UserContext))

    const [profileState, setProfileState] = useState<ProfileState>({
        data: null,
        loading: false,
        error: null
    })

    const [buttonState, setButtonState] = useState<LoadingErrorState>({
        loading: false,
        error: null
    })

    const isUser = user?.id === profileState.data?.id
    const hasSentReq = 
        profileState.data?.connection?.status == "pending" && 
        profileState.data.connection.senderId == user?.id
    const hasPendingReq = 
        profileState.data?.connection?.status == "pending" && 
        profileState.data.connection.receiverId == user?.id
    const isConnection = profileState.data?.connection?.status == "accepted"
    
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                setProfileState({
                    data: null,
                    loading: true,
                    error: null
                })
                const res = await authFetch(`/v1/users/${userId}`, setUser, {signal: controller.signal})
                if (res.ok) {
                    const json = await res.json() as {data: Profile}
                    setProfileState({
                        data: json.data,
                        loading: false,
                        error: null
                    })
                }
                else
                    throw new Error("something went wrong")
            }
            catch(e) {
                if (e instanceof Error && e.name != "AbortError")
                    setProfileState({
                        data: null,
                        loading: false,
                        error: e.message
                    })
                else if (!(e instanceof Error))
                    setProfileState({
                        data: null,
                        loading: false,
                        error: "error fetching profile"
                    })
            }
        })();

        return () => controller.abort()
        
    }, [setUser, userId])
    
    return (
        <div className={styles.container}>
            {
                profileState.error !== null ?
                    <SectionText text={profileState.error} /> :
                profileState.loading ?
                    <SectionText text="Loading..." /> :
                profileState.data ?
                <>
                    <EditProfileDialog />
                    <div className={styles.coverPhoto}></div>

                    <section className={styles.profileContainer}>
                        <img src={profileState.data.pfpPath} alt="profile picture" className="profile"/>
                        <div>
                            <div className={styles.infoContainer}>
                                <h3>{profileState.data.username}</h3>
                            </div>
                            <div className={styles.btnContainer}>
                                {
                                    isUser ?
                                        <button>Edit Profile</button>
                                    : hasSentReq ?
                                        <button
                                            onClick={() => handleRemoveConnection(
                                                setUser,
                                                setButtonState, 
                                                {
                                                    from: "profile",
                                                    profileState,
                                                    setProfileState,
                                                }
                                            )}
                                            disabled={buttonState.loading}
                                        >
                                            Cancel Request
                                        </button>
                                    : hasPendingReq ?
                                        <div>
                                            <button
                                                onClick={() => handleRemoveConnection(
                                                    setUser,
                                                    setButtonState, 
                                                    {
                                                        from: "profile",
                                                        profileState,
                                                        setProfileState,
                                                    }
                                                )}
                                                disabled={buttonState.loading}
                                            >
                                                Reject Request
                                            </button>
                                            <button 
                                                onClick={() => handleAcceptRequest(
                                                    setUser,
                                                    setButtonState,
                                                    {
                                                        from: "profile",
                                                        profileState,
                                                        setProfileState,
                                                    }
                                                )}
                                                className={styles.colored}
                                                disabled={buttonState.loading}
                                            >
                                                Accept Request
                                            </button>
                                        </div>
                                    : isConnection ?
                                        <button
                                            onClick={() => handleRemoveConnection(
                                                setUser,
                                                setButtonState, 
                                                {
                                                    from: "profile",
                                                    profileState,
                                                    setProfileState,
                                                }
                                            )}
                                            disabled={buttonState.loading}
                                        >
                                            Remove Connection
                                        </button>
                                    :
                                        <button 
                                            className={styles.colored}
                                            onClick={() => handleAddConnection(
                                                setUser, 
                                                setButtonState,
                                                {  
                                                    from: "profile",
                                                    user,
                                                    profileState, 
                                                    setProfileState,
                                                }
                                            )}
                                            disabled={buttonState.loading}
                                        >
                                            Add User
                                        </button>
                                }
                            </div>
                            {   // todo: turn into toast in the future
                                buttonState.error && 
                                    <p>{buttonState.error}</p>
                            }
                            <div>
                                <p className={styles.description}>{profileState.data.description ? profileState.data.description : "This user has no description."}</p>
                            </div>
                        </div>
                    </section>
                </> :
                <SectionText text="User not found." />
            }
            
        </div>
    )
}