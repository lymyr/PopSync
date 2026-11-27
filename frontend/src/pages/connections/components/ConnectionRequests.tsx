import React, { useContext, useEffect, useState } from "react";
import authFetch from "../../../features/auth/utils/authFetch";
import removeNullType from "../../../features/auth/utils/removeNullType";
import UserContext from "../../../features/auth/contexts/UserContext";
import HeaderSection from "../../../components/HeaderSection";
import SectionText from "../../../components/SectionText";
import ConnectionCard from "./ConnectionCard";
import type { AcceptedConnection, PendingConnection } from "../../../types/connection/Connection";

interface ConState {
    loading: boolean;
    error: null | string;
}

interface Props {
    connections: PendingConnection[]
    setConnections: React.Dispatch<React.SetStateAction<PendingConnection[]>>
    setAcceptedConnections: React.Dispatch<React.SetStateAction<AcceptedConnection[]>>
    acceptedConnections: AcceptedConnection[]
}

export default function ConnectionRequests({
    connections, 
    setConnections, 
    setAcceptedConnections,
    acceptedConnections
}: Props) {
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
                    const json = await res.json() as {data: PendingConnection[]}
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <HeaderSection title="Connection Requests">
            {
                conState.error ?
                    <SectionText text={conState.error}/> :
                conState.loading ?
                    <SectionText text="Loading..." /> :
                connections.length > 0 ?
                <ul className="list-reset">
                    {
                        connections
                            .filter(c => c.status == "pending")
                            .map(c => 
                                <li key={`${c.sender.id}-${c.receiver.id}`}>
                                    <ConnectionCard 
                                        userDetails={c.sender} 
                                        meta={{
                                            connections, 
                                            setConnections,
                                            acceptedConnections,
                                            setAcceptedConnections
                                        }}
                                    />
                                </li>
                            )
                    }
                </ul> :
                <SectionText text="No connection request found."/>
                
            }
        </HeaderSection>
    )
}