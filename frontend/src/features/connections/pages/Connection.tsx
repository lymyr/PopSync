import PageContainer from "../../../components/PageContainer";
import ConnectionCard from "../components/ConnectionCard";
import styles from "./Connection.module.css"

export default function Connection() {
    return (
        <PageContainer>
            <div className={styles.container}>
                <div className={styles.section}>
                    <h1>Connection Requests</h1>
                    <div>
                        <ConnectionCard />
                        <ConnectionCard />
                        <ConnectionCard />
                    </div>
                </div>
                <div className={styles.section}>
                    <h1>Connections</h1>
                    <div>
                        <p className={styles.text}>List is empty D:</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}