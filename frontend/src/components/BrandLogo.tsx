import styles from "./BrandLogo.module.css"

export default function BrandLogo() {

    return (
        <div className={styles.container}>
            <div>
                <img 
                    src="../../public/logo2-bright.png"
                    alt="Logo"
                />
            </div>
            <p>Pop<span>Sync</span></p>
        </div>
    )
}