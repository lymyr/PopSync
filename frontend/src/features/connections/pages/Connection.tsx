import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import SectionText from "../../../components/SectionText";
import ConnectionCard from "../components/ConnectionCard";
import styles from "./Connection.module.css"

export default function Connection() {
    return (
        <PageContainer pageTitle="Connections">
            <div className={styles.container}>
                <HeaderSection title="Connection Requests">
                    <ConnectionCard />
                    <ConnectionCard />
                    <ConnectionCard />
                </HeaderSection>

                <HeaderSection title="Connections">
                    <SectionText text="You have no connections."/>
                </HeaderSection>
            </div>
        </PageContainer>
    )
}