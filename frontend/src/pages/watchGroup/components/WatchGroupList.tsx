import { Link } from "react-router";
import styles from "./WatchGroupList.module.css"

export default function WatchGroupList() {
    return (
        <ol className={styles.container}>
            <li><Link to={"#"}>Watch group name</Link></li>
        </ol>
    )
}