import type { RouteObject } from "react-router";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Timeline from "./pages/timeline/Timeline";
import Connection from "./pages/connections/Connection";
import PostDialog from "./components/posts/PostDialog";
import Profile from "./pages/profile/Profile";
import WatchList from "./pages/watchlist/WatchList";
import WatchGroup from "./pages/watchGroup/WatchGroup";
import SearchResults from "./pages/search/SearchResults";
import App from "./App";

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />,
        children: [
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
                path: "/profile/:id",
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
    }
]

export default routes