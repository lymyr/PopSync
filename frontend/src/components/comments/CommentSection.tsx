import styles from "./CommentSection.module.css"
import CommentThread from "./CommentThread"

export default function CommentSection() {
    return (
        <section className={styles.container}>
            <h2 className="hidden-visually">Comments</h2>
            <ol>
                <li><CommentThread /></li>
            </ol>
        </section>
    )
}