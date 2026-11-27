import { useEffect, useRef } from "react";
import Dialog from "../../../components/Dialog";
import styles from "./EditProfileDialog.module.css"

export default function EditProfileDialog() {
    const dialogRef: React.Ref<HTMLDialogElement> | undefined = useRef(null)

    useEffect(() => {
        // if (dialogRef && dialogRef.current)
        //     dialogRef.current.showModal()
    }, [dialogRef])

    return (
        <Dialog
            headerText="Edit Profile"
            ref={dialogRef}
        >
            <form className={styles.container}>
                <div>
                    <label htmlFor="pfp-input">Profile Picture</label>
                    <input id="pfp-input" type="file" />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea id="description" />
                </div>
                <button className="actionBtn">Save</button>
            </form>
        </Dialog>
    )
}