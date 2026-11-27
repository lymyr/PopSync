import { useEffect, useRef } from "react";
import Post from "./Post";
import Dialog from "../Dialog";
import CommentSection from "../comments/CommentSection";
import CommentForm from "../comments/CommentForm";
import styles from "./PostDialog.module.css"

export default function PostDialog() {
    const dialogRef: React.Ref<HTMLDialogElement> | undefined = useRef(null)

    useEffect(() => {
        if (dialogRef?.current)
            dialogRef.current.showModal()
    }, [dialogRef])

    // use case to consider: user navigates here via history/url, 
    // refetch post as well in that case
    return (
        <Dialog
            headerText="Post"
            ref={dialogRef}
        >
            <Post />
            <section className={styles.commentFormContainer}>
                <h3>Add a comment</h3>
                <CommentForm />
            </section>
            <CommentSection />
        </Dialog>
    )
}