import { useState } from "react"
import styles from "./Post.module.css"

export default function Post() {
    const [content, ] = useState("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint consequatur atque sed? Doloremque corrupti quasi quos sequi suscipit, cupiditate ex itaque tempora quis assumenda saepe accusamus explicabo ducimus voluptas nihil.")
    const [showAll, setShowAll] = useState(false)
    
    return (

        <div className={styles.container}>
            <div className={styles.authorContainer}>
                <img
                    src="/defaultPfp.webp"
                    alt="Profile picture"
                />
                <div>
                    <p>Username</p>
                    <p>Sept 05, 4312 • Created at Sept 04, 2138</p>
                </div>
            </div>
            <div className={styles.ratingContainer}>
                <p className={styles.rating}>10 / 10</p>
                <p>Movie/show Title extra extra extra extra extra extra extra extra extra extra extra extra long title example</p>
            </div>
            <div className={styles.contentContainer}>
                {/* todo: check if it works with \n */}
                <p>
                    {
                        !showAll && content.length > 80 ? 
                            content.split("").slice(0, 70).join("") + "..." 
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
                <button className={`${styles.likeContainer} ${styles.liked}`}>
                    <p>99+</p>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"></path></g></svg>
                </button>
                <button>
                    <p>99+</p>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_429_11233)"> <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" stroke-linecap="round" stroke-linejoin="round"></path> </g></g></svg>
                </button>
            </div>
        </div>
    )
}