import { Outlet } from "react-router";
import PageContainer from "../../../components/PageContainer";
import Posts from "../components/Posts";
import ReviewForm from "../components/ReviewForm";

export default function Timeline() {
    // todo: find a way to fetch ONLY the comments if a post was clicked
    return (
        <PageContainer pageTitle="Timeline">
            <ReviewForm />
            <Posts />
            <Outlet />
        </PageContainer>
    )
}