import styles from "./BrandLogo.module.css"

export default function BrandLogo() {

    return (
        <div className={styles.container}>
            <div>
                <img 
                    src="/logo-purple.png"
                    alt="Logo"
                />
            </div>
            <p>PopSync</p>
        </div>
    )
}