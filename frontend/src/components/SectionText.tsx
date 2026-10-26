import styles from "./SectionText.module.css"

export default function SectionText({text}: {text: string}) {
    return (<p className={styles.text}>{text}</p>)
}