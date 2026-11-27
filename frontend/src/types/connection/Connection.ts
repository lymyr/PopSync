interface UserDetails {
    id: number;
    pfpPath: string;
    username: string;
}

export interface Connection {
    dateAdded: Date;
    dateUpdated: Date;
    receiver: UserDetails;
    sender: UserDetails;
    status: "pending" | "accepted"
}

export interface PendingConnection extends Connection {
    status: "pending"
}

export interface AcceptedConnection extends Connection {
    status: "accepted"
}