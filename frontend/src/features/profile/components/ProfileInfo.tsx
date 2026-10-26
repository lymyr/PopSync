import EditProfileDialog from "./EditProfileDialog"
import styles from "./ProfileInfo.module.css"

export default function ProfileInfo() {
    const isUser = false
    const hasSentReq = isUser ? false : false
    const isConnection = isUser ? false : true
    const connectionNum = "999+"
    return (
        <div className={styles.container}>
            <EditProfileDialog />
            <div className={styles.coverPhoto}></div>

            <section className={styles.profileContainer}>
                <img src="/defaultPfp.webp" alt="profile picture" className="profile"/>
                <div>
                    <div className={styles.infoContainer}>
                        <h3>20Character username</h3>
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