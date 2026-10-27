import type { RouteObject } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Timeline from "./pages/Timeline";
import Connection from "./features/connections/pages/Connection";
import PostDialog from "./features/post/components/PostDialog";
import Profile from "./features/profile/pages/Profile";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <Timeline />,
        children: [
            {
                path: "/posts/:postId",
                element: <PostDialog />
            }
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/connections",
        element: <Connection />
    },
    {
        path: "/profile",
        element: <Profile />
    }
]

export default routes