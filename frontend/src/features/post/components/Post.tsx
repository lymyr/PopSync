import { useState } from "react"
import styles from "./Post.module.css"
import InteractionBtn from "../../../components/InteractionBtn"
import LikeBtn from "../../../components/LikeBtn"

export default function Post() {
    const [content, ] = useState("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint consequatur atque sed? Doloremque corrupti quasi quos sequi suscipit, cupiditate ex itaque tempora quis assumenda saepe accusamus explicabo ducimus voluptas nihil.")
    const [showAll, setShowAll] = useState(false)
    
    return (
        <article className={styles.container}>
            <header className={styles.authorContainer}>
                <img
                    src="/defaultPfp.webp"
                    alt="Profile picture"
                    className="profile"
                />
                <div>
                    <a href="#">Username</a>
                    <p><time>Sept 04, 2138</time> <span aria-hidden="true">•</span> Updated at <time>Sept 05, 4312</time></p>
                </div>
            </header>
            <p className={styles.ratingContainer}>
                <span className={styles.rating}>10 / 10</span>
                <span>Movie/show Title extra extra extra extra extra extra extra extra extra extra extra extra long title example</span>
            </p>
            <div className={styles.contentContainer}>
                {/* todo: check if it works with \n */}
                <p>
                    {
                        !showAll && content.length > 80 ? 
                            content.split("").slice(0, 70).join("") + "... " 
                        : 
                            content
                    } 
                    {
                        !showAll &&
                            <button onClick={() => setShowAll(true)} >Show more</button>
                    }
                    
                </p>
            </div>
            <div className={styles.posterContainer}>
                <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqH66hVwLyJeR249iVE5cwV6pE7JvFm65HFKOHYCNtCQ&s=10"
                    alt="Movie/show poster"
                />
            </div>
            <div className={styles.interactionContainer}>
                <LikeBtn amount={"99+"} isFilled={true}/>
                <InteractionBtn amount={"99+"}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clipPath="url(#clip0_429_11233)"> <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" strokeLinecap="round" strokeLinejoin="round"></path> </g></g></svg>
                </InteractionBtn>
            </div>
        </article>
    )
}