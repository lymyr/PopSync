import { useParams } from "react-router";
import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";
import SectionText from "../../../components/SectionText";
import Posts from "../../post/components/Posts";
import AccountManagement from "../components/AccountManagement";
import ProfileInfo from "../components/ProfileInfo";
import removeNullType from "../../../utils/removeNullType";
import { useContext } from "react";
import UserContext from "../../../contexts/UserContext";

export default function Profile() {
    const params = useParams()
    const userId = params.id
    if (userId === undefined)
        throw new Error("userId params is undefined")
    const {user} = removeNullType(useContext(UserContext))
    

    return (
        <PageContainer pageTitle="User">
            <HeaderSection title="Profile">
                <ProfileInfo userId={userId}/>
                { user?.id.toString() === userId && <AccountManagement /> }
                
                <section>
                    <h3>Posts</h3>
                    <Posts />
                    <SectionText text="No posts yet..."/>
                </section>
            </HeaderSection>
        </PageContainer>
        
    )
}