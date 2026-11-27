import { Link } from "react-router";
import styles from "./ConnectionCard.module.css"
import handleRemoveConnection from "../../../features/connections/handlers/handleRemoveConnection";
import removeNullType from "../../../features/auth/utils/removeNullType";
import { useContext, useState } from "react";
import UserContext from "../../../features/auth/contexts/UserContext";
import type { LoadingErrorState } from "../../../types/LoadingErrorState";
import type { AcceptedConnection, PendingConnection } from "../../../types/connection/Connection";
import handleAcceptRequest from "../../../features/connections/handlers/handleAcceptRequest";

interface Meta {
    connections: PendingConnection[]
    setConnections: React.Dispatch<React.SetStateAction<PendingConnection[]>>;
    setAcceptedConnections: React.Dispatch<React.SetStateAction<AcceptedConnection[]>>;
    acceptedConnections: AcceptedConnection[]
} 

interface Props {
    userDetails: PendingConnection["sender"] | PendingConnection["receiver"]
    meta?: Meta
}

export default function ConnectionCard({
    userDetails, 
    meta
}: Props) {
    const {setUser} = removeNullType(useContext(UserContext))
    const [buttonState, setButtonState] = useState<LoadingErrorState>({
        loading: false,
        error: null
    })

    return (
            <div className={styles.container}>
                <Link to={`/profile/${userDetails.id}`} className={styles.profileLink}/>
                <img
                    src={userDetails.pfpPath}
                    alt="profile picture"
                />
                <div>
                    <div>
                        <p>{userDetails.username}</p>
                        {
                            meta !== undefined &&
                                <p>Sept 99, 2359</p>
                        }
                    </div>
                    {
                        meta !== undefined &&
                            <div className={styles.btnContainer}>
                                <button
                                    onClick={() => handleRemoveConnection(
                                        setUser,
                                        setButtonState,
                                        {
                                            from: "connections",
                                            userId: userDetails.id,
                                            connections: meta.connections,
                                            setConnections: meta.setConnections
                                        }
                                    )}
                                    disabled={buttonState.loading}
                                >
                                    Reject
                                </button>
                                <button
                                    disabled={buttonState.loading}
                                    onClick={() => handleAcceptRequest(
                                        setUser,
                                        setButtonState,
                                        {
                                            from: "connections",
                                            userId: userDetails.id,
                                            connections: meta.connections,
                                            setConnections: meta.setConnections,
                                            setAcceptedConnections: meta.setAcceptedConnections,
                                            acceptedConnections: meta.acceptedConnections
                                        }
                                    )}
                                >
                                    Accept
                                </button>
                            </div>
                    }
                </div>
            </div>
    )
}