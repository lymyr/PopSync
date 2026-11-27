import { useState } from "react";
import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import SectionText from "../../../components/SectionText";
import ConnectionRequests from "../components/ConnectionRequests";
import styles from "./Connection.module.css"

interface UserDetails {
    id: number;
    pfpPath: string;
    username: string;
}

export interface Connection {
    dateAdded: Date;
    dateUpdated: Date;
    receiver: UserDetails;
    sender: UserDetails;
    status: "pending" | "accepted"
}

export default function Connection() {
    const [connections, setConnections] = useState<Connection[]>([])

    return (
        <PageContainer pageTitle="Connections">
            <div className={styles.container}>
                <ConnectionRequests connections={connections} setConnections={setConnections}/>

                <HeaderSection title="Connections">
                    <SectionText text="You have no connections."/>
                </HeaderSection>
            </div>
        </PageContainer>
    )
}