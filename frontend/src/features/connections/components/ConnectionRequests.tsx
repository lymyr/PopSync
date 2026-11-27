import { useContext, useEffect, useState } from "react";
import authFetch from "../../../utils/authFetch";
import removeNullType from "../../../utils/removeNullType";
import UserContext from "../../../contexts/UserContext";
import HeaderSection from "../../../components/HeaderSection";
import type { Connection } from "../pages/Connection";
import SectionText from "../../../components/SectionText";
import ConnectionCard from "./ConnectionCard";

interface ConState {
    loading: boolean;
    error: null | string;
}

interface Props {
    connections: Connection[]
    setConnections: React.Dispatch<React.SetStateAction<Connection[]>>
}

export default function ConnectionRequests({connections, setConnections}: Props) {
    const [conState, setConState] = useState<ConState>({
        loading: false,
        error: null
    })
    const {setUser} = removeNullType(useContext(UserContext))

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setConState({loading: true, error: null})
                const res = await authFetch("/v1/connections/pending", setUser)
                if (res.ok) {
                    const json = await res.json() as {data: Connection[]}
                    setConnections([...connections, ...json.data])
                }
                else {
                    throw new Error("something went wrong")
                }
                setConState({loading: false, error: null})
            }
            catch(e) {
                if (e instanceof Error && e.name != "AbortError")
                    setConState({loading: false, error: e.message})
                else if (!(e instanceof Error))
                    setConState({loading: false, error: "something went wrong"})
            }
        })();
        

        return () => controller.abort()

    }, [])

    return (
        <HeaderSection title="Connection Requests">
            {
                conState.error ?
                    <SectionText text={conState.error}/> :
                conState.loading ?
                    <SectionText text="Loading..." /> :
                <ul className="list-reset">
                    {
                        connections
                            .filter(c => c.status == "pending")
                            .map(c => 
                                <li>
                                    <ConnectionCard userDetails={c.sender} isRequest={true}/>
                                </li>
                            )
                    }
                </ul>
                
            }
        </HeaderSection>
    )
}