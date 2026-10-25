import { useState } from "react"
import styles from "./ReviewForm.module.css"

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
                <textarea 
                    placeholder="What are your thoughts?"
                    wrap="soft"
                    rows={content.length > 0 ? content.length : 1}
                    onChange={(e) => {
                        setContent(e.target.value.split(`\n`))
                    }}
                />
            </div>
            </div>
            <button>Post</button>
        </form>
    )
}