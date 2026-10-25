import type { RouteObject } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Timeline from "./features/timeline/pages/Timeline";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <Timeline />
    },
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