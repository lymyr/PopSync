import Comment from "./Comment"
import styles from "./CommentThread.module.css"

export default function CommentThread() {

    // todo: add map function
    // each comment must be wrapped in div.container, while its replies must be wrapped in div.subcommentContainer
    return (
        <section>
            <h2>Comments</h2>
            <div className={styles.container}>
                <Comment />
                <div className={styles.subcommentContainer}>
                    <div className={styles.container}>
                        <Comment />
                        <div className={styles.subcommentContainer}>
                            <div className={styles.container}>
                                <Comment />
                                <div className={styles.subcommentContainer}>
                                    <div className={styles.container}>
                                        <Comment />
                                        <button className={styles.seeMoreReplies}>See more replies</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.subcommentContainer}></div>
                    </div>
                    <div className={styles.container}>
                        <Comment />
                        <div className={styles.subcommentContainer}>
                            <div className={styles.container}>
                                <Comment />
                                <button className={styles.seeMoreReplies}>See more replies</button>
                            </div>
                            <div className={styles.container}>
                                <Comment />
                                <button className={styles.seeMoreReplies}>See more replies</button>
                            </div>
                            <div className={styles.container}>
                                <Comment />
                                <button className={styles.seeMoreReplies}>See more replies</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}