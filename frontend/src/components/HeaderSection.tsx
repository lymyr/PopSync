import type { ReactNode } from "react";
import styles from "./HeaderSection.module.css"

interface props {
    title: string;
    children: ReactNode
}

export default function HeaderSection({title, children}: props) {
    return (
        <section className={styles.container}>
            <h2>{title}</h2>
            <div>
                {children}
            </div>
        </section>
    )
}