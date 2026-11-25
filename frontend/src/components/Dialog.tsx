import type { ReactNode } from "react";
import styles from "./Dialog.module.css"
import type React from "react";

interface props {
    headerText: string;
    children: ReactNode;
    dialogAttr?: React.HTMLAttributes<HTMLDialogElement>;
    ref?: React.RefObject<HTMLDialogElement | null>
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
                <button 
                    aria-label="close modal"
                    onClick={() => ref?.current?.close()}
                >
                    X
                </button>
                <h2>{headerText}</h2>
            </div>
            {children}
        </dialog>
    )
}