import type { ReactNode, Ref } from "react";
import styles from "./Dialog.module.css"

interface props {
    headerText: string;
    children: ReactNode;
    dialogAttr?: React.HTMLAttributes<HTMLDialogElement>;
    ref?: Ref<HTMLDialogElement>
}

export default function Dialog({
    headerText,
    children,
    dialogAttr,
    ref
}: props) {
    return (
        <dialog 
            className={styles.container}
            {...dialogAttr}
            ref={ref}
        >
            <div className={styles.header}>
                <button aria-label="close modal">X</button>
                <h2>{headerText}</h2>
            </div>
            {children}
        </dialog>
    )
}