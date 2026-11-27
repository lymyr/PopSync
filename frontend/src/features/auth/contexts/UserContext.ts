import { createContext } from "react";

export interface User {
    username: string;
    pfpPath: string;
    description: string;
    id: number
}

interface UserContext {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default createContext<null | UserContext>(null)