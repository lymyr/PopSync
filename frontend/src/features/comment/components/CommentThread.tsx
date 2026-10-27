import Comment from "./Comment"
import styles from "./CommentThread.module.css"

export default function CommentThread({level=1}) {
    // add null checks in the future once backend is up
    if (level > 3)
        return (
            <></>
        )
    
    return (
        <div className={level > 1 ?
            `${styles.thread} ${styles.reply}` :
            styles.thread
        }>
            <Comment />
            <ol className={styles.repliesContainer}>
                <CommentThread level={level+1} />
            </ol>
        </div>
    )
}