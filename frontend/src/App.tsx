import { Outlet } from "react-router";
import UserContext, { type User } from "./contexts/UserContext";
import { useState } from "react";

export default function App() {
    const savedUser = localStorage.getItem("user")
    const [user, setUser] = useState<User | null>(savedUser ? JSON.parse(savedUser) : null)
    return (
        <>
        <UserContext value={{user, setUser}}>
            <Outlet />
        </UserContext>
        </>
    )
}
