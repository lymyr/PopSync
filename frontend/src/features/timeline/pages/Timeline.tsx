import PageContainer from "../../../components/PageContainer";
import Posts from "../components/Posts";
import ReviewForm from "../components/ReviewForm";

export default function Timeline() {
    return (
        <PageContainer>
            <ReviewForm />
            <Posts />
        </PageContainer>
    )
}