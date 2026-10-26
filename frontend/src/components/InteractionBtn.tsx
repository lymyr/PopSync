import type { ReactNode } from "react";
import styles from "./InteractionBtn.module.css"

export interface props {
    amount: number | string;
    isFilled?: boolean;
    children: ReactNode;
}

export default function InteractionBtn({amount, isFilled=false, children} : props) {

    return (
        <button 
            className={
                isFilled ? 
                    `${styles.container} ${styles.filled}` :
                    styles.container
            }
        >
            <p>{amount}</p>
            {children}
        </button>
    )
}