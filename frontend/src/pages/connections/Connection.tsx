import { useState } from "react";
import PageContainer from "../../components/PageContainer";
import ConnectionRequests from "./components/ConnectionRequests";
import styles from "./Connection.module.css"
import type { AcceptedConnection, PendingConnection } from "../../types/connection/Connection";
import AcceptedConnections from "./components/AcceptedConnections";

export default function Connection() {
    const [pendingConnections, setPendingConnections] = useState<PendingConnection[]>([])
    const [acceptedConnections, setAcceptedConnections] = useState<AcceptedConnection[]>([])

    return (
        <PageContainer pageTitle="Connections">
            <div className={styles.container}>
                <ConnectionRequests 
                    connections={pendingConnections} 
                    setConnections={setPendingConnections}
                    setAcceptedConnections={setAcceptedConnections}
                    acceptedConnections={acceptedConnections}
                />
                <AcceptedConnections connections={acceptedConnections} setConnections={setAcceptedConnections}/>
            </div>
        </PageContainer>
    )
}