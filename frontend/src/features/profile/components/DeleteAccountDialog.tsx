import { useContext, useEffect, useState } from "react";
import Dialog from "../../../components/Dialog";
import styles from "./DeleteAccountDialog.module.css"
import handleDeleteAccount from "../handlers/handleDeleteAccount";
import removeNullType from "../../../utils/removeNullType";
import UserContext from "../../../contexts/UserContext";

interface Props {
    ref: React.RefObject<HTMLDialogElement | null>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DeleteAccountDialog({ref, loading, setLoading}: Props) {
    const [hasUnderstood, setHasUnderstood] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const {setUser} = removeNullType(useContext(UserContext))

    useEffect(() => {
        ref.current?.addEventListener("close", () => {
            setHasUnderstood(false)
        })
    }, [ref])

    return (
        <Dialog headerText="Delete Account" ref={ref}>
            <div className={styles.container}>
                <p>
                    Deleting your account will permanently erase all associated data, 
                    including your watchlist, watch groups, connections, reviews, and comments. 
                    This action is <b>IRREVERSIBLE</b>.
                </p>
                <form 
                    className={styles.formContainer}
                    onSubmit={(e) => {
                        handleDeleteAccount(e, setUser, setLoading, setError)
                    }}
                >
                    <div className={styles.confirmationContainer}>
                        <input
                            type="checkbox"
                            id="understood-deletion"
                            checked={hasUnderstood}
                            onChange={() => setHasUnderstood(!hasUnderstood)}
                        />
                        <label htmlFor="understood-deletion">I understand</label>
                    </div>
                    {error && <p>{error}</p>}
                    <div className={styles.buttonsContainer}>
                        <button 
                            disabled={loading}
                            onClick={() => ref.current?.close()} 
                            type="button"
                        >
                            Cancel
                        </button>
                        <button disabled={!hasUnderstood || loading}>COMMENCE DELETION!!</button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}