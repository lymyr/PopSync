import Header from "./Header";
import styles from "./PageContainer.module.css"

interface props {
    children: React.JSX.Element | React.JSX.Element[];
    pageTitle: string;
    hidden?: boolean
}

export default function PageContainer({pageTitle, children, hidden=true} : props) {
    return (
        <div className={styles.container}>
            <Header />
            <main>
                <h1
                    className={hidden ? "hidden-visually" : undefined}
                >
                    {pageTitle}
                </h1>
                <div>
                    {children}
                </div>
            </main>
        </div>
    )
}