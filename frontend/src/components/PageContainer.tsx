import Header from "./Header";
import styles from "./PageContainer.module.css"

export default function PageContainer({children} : {children: React.JSX.Element | React.JSX.Element[]}) {
    return (
        <div className={styles.container}>
            <Header />
            <main>
                {children}
            </main>
        </div>
    )
}