import { useState } from "react"
import AdaptiveTextArea from "../../../components/AdaptiveTextArea"
import styles from "./CommentForm.module.css"

export default function CommentForm({placeholder="What are your thoughts?"}) {
    const [content, setContent] = useState([""])

    return (
        <div className={styles.container}>
            <img className="profile" src="/defaultPfp.webp" alt="profile picture"/>
            <form>
                <AdaptiveTextArea
                    content={content}
                    setContent={setContent}
                    attributes={{
                        placeholder: `${placeholder}`
                    }}
                />
                <button>Submit</button>
            </form>
        </div>
    )
}