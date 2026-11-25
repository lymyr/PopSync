import { useContext } from "react"
import removeNullType from "../../../utils/removeNullType"
import EditProfileDialog from "./EditProfileDialog"
import styles from "./ProfileInfo.module.css"
import UserContext from "../../../contexts/UserContext"

export default function ProfileInfo() {
    const {user} = removeNullType(useContext(UserContext))
    
    const isUser = false
    const hasSentReq = isUser ? false : false
    const isConnection = isUser ? false : true
    const connectionNum = "999+"
    
    
    return (
        <div className={styles.container}>
            <EditProfileDialog />
            <div className={styles.coverPhoto}></div>

            <section className={styles.profileContainer}>
                <img src={user?.pfpPath} alt="profile picture" className="profile"/>
                <div>
                    <div className={styles.infoContainer}>
                        <h3>{user?.username}</h3>
                        <p>{connectionNum} Connections</p>
                    </div>
                    <div className={styles.btnContainer}>
                        {
                            isUser ?
                                <button>Edit Profile</button>
                            : hasSentReq ?
                                <button>Cancel Request</button>
                            : isConnection ?
                                <button>Remove Connection</button>
                            :
                                <button className={styles.colored}>Add User</button>
                        }
                    </div>
                </div>
            </section>
        </div>
    )
}