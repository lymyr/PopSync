import type { User } from "../../features/auth/contexts/UserContext";
import type { ProfileState } from "../../pages/profile/components/ProfileInfo";
import type { AcceptedConnection, PendingConnection } from "./Connection";

export type OriginProps = 
{
    from: "profile";
    profileState: ProfileState;
    setProfileState: React.Dispatch<React.SetStateAction<ProfileState>>;
    user?: User | null
} |
{
    from: "connections";
    userId: number | string;
    connections: PendingConnection[];
    setConnections: React.Dispatch<React.SetStateAction<PendingConnection[]>>
    setAcceptedConnections?: React.Dispatch<React.SetStateAction<AcceptedConnection[]>>
    acceptedConnections?: AcceptedConnection[]
}