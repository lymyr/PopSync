import LikeBtn from "../../../components/LikeBtn"
import styles from "./Comment.module.css"

export default function Comment() {
    return (
        <article className={styles.container}>
            <img src="/defaultPfp.webp" alt="profile picture" className="profile"/>
            <div>
                <div className={styles.commentHeader}>
                    <p>Username <span>• <time>Sept 05, 4312</time></span></p>
                </div>
                <div className={styles.commentContent}>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque unde enim nobis necessitatibus accusantium quaerat, voluptate esse tempora sit. Neque totam sed sunt excepturi reprehenderit mollitia corrupti nihil magnam consectetur.
                    </p>
                </div>
                <div>
                    <button>Reply</button>
                    <LikeBtn amount={"99+"} />
                </div>
            </div>
        </article>
    )
}