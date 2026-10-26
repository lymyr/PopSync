import { useEffect, useRef } from "react";
import Post from "./Post";
import CommentThread from "./CommentThread";
import Dialog from "../../../components/Dialog";

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
            <CommentThread />
        </Dialog>
    )
}