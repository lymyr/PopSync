import styles from "./ConnectionCard.module.css"

export default function ConnectionCard() {
    const isRequest = true;

    return (
        <div className={styles.container}>
            <img
                src="/defaultPfp.webp"
                alt="profile picture"
            />
            <div>
                <div>
                    <p>very very very very very very very very long username</p>
                    {
                        isRequest &&
                            <p>Sept 99, 2359</p>
                    }
                </div>
                {
                    isRequest &&
                        <div className={styles.btnContainer}>
                            <button>Reject</button>
                            <button>Accept</button>
                        </div>
                }
            </div>
            
        </div>
    )
}