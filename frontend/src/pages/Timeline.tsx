import { Outlet } from "react-router";
import PageContainer from "../components/PageContainer";
import Posts from "../features/post/components/Posts";
import ReviewForm from "../features/post/components/ReviewForm";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";

export default function Timeline() {
    const userContext = useContext(UserContext)
    if (!userContext)
        throw new Error("UserContext must be used within a provider")
    const {user} = userContext
    console.log(user)
    // todo: find a way to fetch ONLY the comments if a post was clicked
    return (
        <PageContainer pageTitle="Timeline">
            <ReviewForm />
            <Posts />
            <Outlet />
        </PageContainer>
    )
}