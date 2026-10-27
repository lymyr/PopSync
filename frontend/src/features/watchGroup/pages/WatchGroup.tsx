import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import WatchGroupForm from "../components/WatchGroupForm";
import WatchGroupList from "../components/WatchGroupList";

export default function WatchGroup() {
    return (
        <PageContainer pageTitle="Watch Group">
            <HeaderSection title="Create New Group" >
                <WatchGroupForm />
            </HeaderSection>
            <HeaderSection title="Current Groups">
                <WatchGroupList />
            </HeaderSection>
        </PageContainer>
    )
}