import { Link } from "react-router";
import type { Connection } from "../pages/Connection";
import styles from "./ConnectionCard.module.css"

interface Props {
    userDetails: Connection["sender"] | Connection["receiver"]
    isRequest: boolean;
}

export default function ConnectionCard({userDetails, isRequest}: Props) {
    return (
        <Link to={`/profile/${userDetails.id}`}>
            <div className={styles.container}>
                <img
                    src={userDetails.pfpPath}
                    alt="profile picture"
                />
                <div>
                    <div>
                        <p>{userDetails.username}</p>
                        {
                            isRequest &&
                                <p>Sept 99, 2359</p>
                        }
                    </div>
                    {
                        isRequest &&
                            <div className={styles.btnContainer}>
                                <button>Reject</button>
                                <button>Accept</button>
                            </div>
                    }
                </div>
            
            </div>
        </Link>
    )
}