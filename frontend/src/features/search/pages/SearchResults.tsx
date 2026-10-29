import { useParams } from "react-router";
import HeaderSection from "../../../components/HeaderSection";
import PageContainer from "../../../components/PageContainer";

export default function SearchResults() {
    const param = useParams()
    const filter = param.filter
    const headerText = filter?.split("").map((c, i) => {
        if (i == 0)
            return c.toUpperCase()
        return c
    }).join("")

    return (
        <PageContainer pageTitle="Search Page">
            <HeaderSection title={`${headerText || ""} Results`}>
                <p>Placeholder</p>
            </HeaderSection>
        </PageContainer>
    )
}