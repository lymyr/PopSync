import { useContext, useState } from "react"
import styles from "./ReviewForm.module.css"
import AdaptiveTextArea from "../AdaptiveTextArea"
import removeNullType from "../../features/auth/utils/removeNullType"
import UserContext from "../../features/auth/contexts/UserContext"

export default function ReviewForm() {
    const [content, setContent] = useState([""])

    const {user} = removeNullType(useContext(UserContext))

    // todo: update this in future
    // const [selectedMedia, setSelectedMedia] = useState() 

    return (
        <form className={styles.container}>
            <div className={styles.postContainer}>
                <img 
                    alt="your profile picture" 
                    src={user?.pfpPath}
                    className="profile"
                />
                <div>
                {/* todo: add dropdown for search based off user watch list */}
                <div className={styles.searchContainer}>
                    <input placeholder="Watch List Search" />
                </div>
                {/* todo: should only show once media is selected from search */}
                <div className={styles.selectedMediaContainer}>
                    <button type="button">X</button>
                    <p>Show/Movie asdna slkdnaslkdnaslkd nalksdnad alskd naslkd nasdksa  Title</p>
                </div>
                <AdaptiveTextArea 
                    content={content}
                    setContent={setContent}
                    attributes={{ placeholder: "What are your thoughts?" }}
                />
            </div>
            </div>
            <button className="actionBtn">Post</button>
        </form>
    )
}