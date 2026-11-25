import { Outlet, useNavigate } from "react-router";
import UserContext, { type User } from "./contexts/UserContext";
import { useEffect, useState } from "react";

export default function App() {
    const nav = useNavigate()
    const savedUser = localStorage.getItem("user")
    const [user, setUser] = useState<User | null>(savedUser ? JSON.parse(savedUser) : null)

    useEffect(() => {
        if (user == null)
            nav("/login")
    }, [user, nav])
    return (
        <>
        <UserContext value={{user, setUser}}>
            <Outlet />
        </UserContext>
        </>
    )
}
