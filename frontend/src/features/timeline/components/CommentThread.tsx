import Comment from "./Comment"
import styles from "./CommentThread.module.css"

export default function CommentThread() {

    // todo: add create recursive until level 3, 
        // ol element must be its own component (make it CommentThread.tsx) 
        // and make this CommentSection
    // todo: add comment form
    // todo: refactor timeline feature to post and comment feature folders
    // each comment must be wrapped in div.container, while its replies must be wrapped in div.reply
    return (
        <section className={styles.container}>
            <h2 className="hidden-visually">Comments</h2>
            {/* root comment */}
            <ol> 
                <li className={styles.thread}>
                    <Comment />
                    <ol className={styles.repliesContainer}>
                        <li className={styles.thread}>
                            <Comment />
                            <ol className={styles.repliesContainer}>
                                <li className={styles.thread}>
                                    <Comment />
                                    <ol className={styles.repliesContainer}>
                                        <li className={styles.thread}>
                                            <Comment />
                                            <button className={styles.seeMoreReplies}>See more replies</button>
                                        </li>
                                    </ol>
                                </li>
                            </ol>
                        </li>
                        <li className={styles.thread}>
                            <Comment />
                            <ol className={styles.repliesContainer}>
                                <li className={styles.thread}>
                                    <Comment />
                                    <button className={styles.seeMoreReplies}>See more replies</button>
                                </li>
                                <li className={styles.thread}>
                                    <Comment />
                                    <button className={styles.seeMoreReplies}>See more replies</button>
                                </li>
                                <li className={styles.thread}>
                                    <Comment />
                                    <button className={styles.seeMoreReplies}>See more replies</button>
                                </li>
                            </ol>
                        </li>
                    </ol>
                </li>
            </ol>
        </section>
    )
}