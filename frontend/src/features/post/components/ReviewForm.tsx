import { useState } from "react"
import styles from "./ReviewForm.module.css"
import AdaptiveTextArea from "../../../components/AdaptiveTextArea"

export default function ReviewForm() {
    const [content, setContent] = useState([""])

    // todo: update this in future
    // const [selectedMedia, setSelectedMedia] = useState() 

    return (
        <form className={styles.container}>
            <div className={styles.postContainer}>
                <img 
                    alt="your profile picture" 
                    src="/defaultPfp.webp"
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