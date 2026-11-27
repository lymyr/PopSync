import { useContext, useEffect, useState } from "react";
import HeaderSection from "../../../components/HeaderSection";
import SectionText from "../../../components/SectionText";
import removeNullType from "../../../features/auth/utils/removeNullType";
import type { AcceptedConnection } from "../../../types/connection/Connection";
import ConnectionCard from "./ConnectionCard";
import UserContext from "../../../features/auth/contexts/UserContext";
import type { LoadingErrorState } from "../../../types/LoadingErrorState";
import authFetch from "../../../features/auth/utils/authFetch";

export default function AcceptedConnections({
    connections,
    setConnections
}: { 
    connections: AcceptedConnection[]
    setConnections: React.Dispatch<React.SetStateAction<AcceptedConnection[]>>
}) {
    const {user, setUser} = removeNullType(useContext(UserContext))
    const [conState, setConState] = useState<LoadingErrorState>({
        loading: false,
        error: null
    })

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setConState({error: null, loading: true})
                const res = await authFetch("/v1/connections", setUser)
                if (res.ok) {
                    const json = await res.json() as {data: AcceptedConnection[]}
                    setConnections([...connections, ...json.data])
                }
                else
                    throw new Error("something went wrong")
                setConState({error: null, loading: false})
            }
            catch(e) {
                if (e instanceof Error && e.name != "AbortError")
                    setConState({error: e.message, loading: false})
                else if (!(e instanceof Error))
                    setConState({error: "something went wrong", loading: false})
            }
        })();

        return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <HeaderSection title="Connections">
            {
                conState.error != null ? 
                <SectionText text={conState.error} /> : 
                conState.loading ?
                <SectionText text={"Loading..."} /> :
                connections.length > 0 ?
                <ul className="list-reset">
                    {
                        connections
                            .filter(c => c.status == "accepted")
                            .map(c => {
                            return (
                                <li key={`${c.sender.id}-${c.receiver.id}`}>
                                    <ConnectionCard 
                                        userDetails={
                                            c.sender.id != user?.id ?
                                            c.sender :
                                            c.receiver
                                        }
                                    />
                                </li>
                            )
                        })
                    }
                </ul> :
                <SectionText text="You have no connections."/>
            }
        </HeaderSection>
    )
}