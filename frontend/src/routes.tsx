import type { RouteObject } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

const routes: RouteObject[] = [
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
]

export default routes