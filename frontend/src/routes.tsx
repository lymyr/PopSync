import type { RouteObject } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Timeline from "./pages/Timeline";
import Connection from "./features/connections/pages/Connection";
import PostDialog from "./features/post/components/PostDialog";
import Profile from "./features/profile/pages/Profile";
import WatchList from "./features/watchList/pages/WatchList";
import WatchGroup from "./features/watchGroup/pages/WatchGroup";
import SearchResults from "./features/search/pages/SearchResults";

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
    },
    {
        path: "/watch-list",
        element: <WatchList />
    },
    {
        path: "/watch-group",
        element: <WatchGroup />
    },
    {
        path: "/search/:filter",
        element: <SearchResults />
    }
]

export default routes