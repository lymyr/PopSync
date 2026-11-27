import { useContext, useRef, useState } from "react"
import styles from "./AccountManagement.module.css"
import DeleteAccountDialog from "./DeleteAccountDialog"
import handleLogout from "../../../features/auth/handlers/handleLogout"
import UserContext from "../../../features/auth/contexts/UserContext"
import removeNullType from "../../../features/auth/utils/removeNullType"

export default function AccountManagement() {
    const deleteAccDialogRef = useRef<HTMLDialogElement>(null)
    const {setUser} = removeNullType(useContext(UserContext))
    const [loading, setLoading] = useState(false)
    
    return (
        <>
            <section className={styles.container}>
                <h3>Account Management</h3>
                <ul className="reset-list">
                    <li>
                        <button 
                            className={styles.delete}
                            onClick={() => {
                                if (deleteAccDialogRef.current != null) 
                                    deleteAccDialogRef.current.showModal()
                            }}
                            disabled={loading}
                        >
                            Delete Account
                        </button>
                    </li>
                    <li>
                        <button 
                            className={styles.logout}
                            onClick={() => handleLogout(setUser, setLoading)}
                            disabled={loading}
                        >
                            Log Out
                        </button>
                    </li>
                </ul>
            </section>
            <DeleteAccountDialog ref={deleteAccDialogRef} loading={loading} setLoading={setLoading}/>
        </>
    )
}