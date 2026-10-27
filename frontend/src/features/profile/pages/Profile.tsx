import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import SectionText from "../../../components/SectionText";
import Posts from "../../post/components/Posts";
import ProfileInfo from "../components/ProfileInfo";

export default function Profile() {
    return (
        <PageContainer pageTitle="User">
            <HeaderSection title="Profile">
                <ProfileInfo />
                <section>
                    <h3>Posts</h3>
                    <Posts />
                    <SectionText text="No posts yet..."/>
                </section>
                
            </HeaderSection>
        </PageContainer>
        
    )
}