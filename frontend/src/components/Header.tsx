import { Link, useLocation, useNavigate, useParams } from "react-router";
import BrandLogo from "./BrandLogo";
import styles from "./Header.module.css"
import { useState } from "react";

interface searchData {
    search: string;
    filter: "show" | "movie" | "user";
}

export default function Header() {
    const loc = useLocation()
    const param = useParams()
    const path = loc.pathname.split('/')[1]

    const initialSelect = param.filter == "show" || param.filter == "movie" || param.filter == "user" ? 
        param.filter : "show"
    const [searchData, setSearchData] = useState<searchData>({
        filter: initialSelect,
        search: `${(new URLSearchParams(loc.search)).get("query") || ""}`
    })
    const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined)

    const nav = useNavigate()
    function handleSearch(filter=searchData.filter, query=encodeURIComponent(searchData.search)) {
        if (query.trim() != "")
            nav(`/search/${filter}?query=${query}`)
    }
    
    return (
        <header className={styles.parent}>
            <div className={styles.container}>
                <div>
                    <BrandLogo />
                    <form 
                        className={styles.search}
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <label htmlFor="searchFilter" className="hidden-visually">Filter Search</label>
                        <select 
                            id="searchFilter" 
                            onChange={(e) => {
                                clearTimeout(timeoutId)
                                switch(e.target.value) {
                                    case "show":
                                    case "movie":
                                    case "user":
                                        handleSearch(e.target.value)
                                        setSearchData({...searchData, filter: e.target.value});
                                }  
                            }}
                            value={searchData.filter}
                        >
                            <option value="show">Shows</option>
                            <option value="movie">Movies</option>
                            <option value="user">Users</option>
                        </select>
                        <input type="search" placeholder="Search" 
                            onChange={(e) => {
                                clearTimeout(timeoutId)
                                setTimeoutId(setTimeout(() => {
                                    handleSearch(searchData.filter, e.target.value)
                                }, 1000))
                                setSearchData({...searchData, search: e.target.value})
                            }}
                            value={searchData.search}
                        />
                    </form>
                </div>
                <nav>
                    <ul>
                        <li className={ !path ? styles.selected : undefined }>
                            <Link to="/">
                                <div>
                                    <svg aria-label="Home" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z"></path> </g></svg>
                                    <div className={styles.navLabel}>Home</div>
                                </div>
                            </Link>
                        </li>
                        <li className={
                            path == 'watch-group' ? styles.selected : undefined
                        }>
                            <Link to="/watch-group">
                                <div>
                                    <svg aria-label="Watch Groups" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M8 2.96338L5.75926 0.349182L4.24074 1.65076L6.25437 4H1V15H15V4H9.74563L11.7593 1.65076L10.2407 0.349182L8 2.96338ZM11 6H3V13H11V6Z" ></path> </g></svg>
                                    <div className={styles.navLabel}>Watch Groups</div>
                                </div>
                            </Link>
                        </li>
                        <li className={ path == 'watch-list' ? styles.selected : undefined }>
                            <Link to="/watch-list">
                                <div>
                                    <svg aria-label="Watch List" viewBox="17 15 44 47" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" d="M 48,45L 58,45L 58,48L 48,48L 48,45 Z M 48,50L 58,50L 58,53L 48,53L 48,50 Z M 48,55L 58,55L 58,58L 48,58L 48,55 Z M 44,55L 47,55L 47,58L 44,58L 44,55 Z M 44,50L 47,50L 47,53L 44,53L 44,50 Z M 44,45L 47,45L 47,48L 44,48L 44,45 Z M 21,19.0001L 52.9999,19.0001L 52.9999,43L 48.9999,43.0001L 44.9998,43L 44.9998,40.0001L 28.9999,40.0001L 28.9999,53.0001L 42,53.0001L 42,57L 21,57L 21,19.0001 Z M 28.9999,23.0002L 28.9999,36.0001L 44.9998,36.0001L 44.9998,23.0002L 28.9999,23.0002 Z M 24.9999,36.0001C 23.8954,36.0001 22.9999,36.8955 22.9999,38.0001C 22.9999,39.1046 23.8954,40.0001 24.9999,40.0001C 26.1045,40.0001 26.9999,39.1046 26.9999,38.0001C 26.9999,36.8955 26.1045,36.0001 24.9999,36.0001 Z M 24.9999,29.0001C 23.8954,29.0001 22.9999,29.8956 22.9999,31.0001C 22.9999,32.1047 23.8954,33.0001 24.9999,33.0001C 26.1045,33.0001 26.9999,32.1047 26.9999,31.0001C 26.9999,29.8956 26.1045,29.0001 24.9999,29.0001 Z M 24.9999,22.0001C 23.8954,22.0001 22.9999,22.8956 22.9999,24.0001C 22.9999,25.1047 23.8954,26.0001 24.9999,26.0001C 26.1045,26.0001 26.9999,25.1047 26.9999,24.0001C 26.9999,22.8956 26.1045,22.0001 24.9999,22.0001 Z M 24.9999,50.0001C 23.8954,50.0001 22.9999,50.8955 22.9999,52.0001C 22.9999,53.1046 23.8954,54.0001 24.9999,54.0001C 26.1045,54.0001 26.9999,53.1046 26.9999,52.0001C 26.9999,50.8955 26.1045,50.0001 24.9999,50.0001 Z M 24.9999,43.0001C 23.8954,43.0001 22.9999,43.8955 22.9999,45.0001C 22.9999,46.1046 23.8954,47.0001 24.9999,47.0001C 26.1045,47.0001 26.9999,46.1046 26.9999,45.0001C 26.9999,43.8955 26.1045,43.0001 24.9999,43.0001 Z M 48.9998,36.0001C 47.8953,36.0001 46.9998,36.8955 46.9998,38.0001C 46.9998,39.1046 47.8953,40.0001 48.9998,40.0001C 50.1044,40.0001 50.9998,39.1046 50.9998,38.0001C 50.9998,36.8955 50.1044,36.0001 48.9998,36.0001 Z M 48.9998,29.0002C 47.8953,29.0002 46.9998,29.8956 46.9998,31.0002C 46.9998,32.1047 47.8953,33.0002 48.9998,33.0002C 50.1044,33.0002 50.9998,32.1047 50.9998,31.0002C 50.9998,29.8956 50.1044,29.0002 48.9998,29.0002 Z M 48.9998,22.0002C 47.8953,22.0002 46.9998,22.8956 46.9998,24.0002C 46.9998,25.1047 47.8953,26.0002 48.9998,26.0002C 50.1044,26.0002 50.9998,25.1047 50.9998,24.0002C 50.9998,22.8956 50.1044,22.0002 48.9998,22.0002 Z "></path></g></svg>
                                    <div className={styles.navLabel}>Watch List</div>
                                </div>
                            </Link>
                        </li>
                        <li className={ path == 'connections' ? styles.selected : undefined }>
                            <Link to="/connections">
                                <div>
                                    <svg fill="#000000" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" enableBackground="new 0 0 52 52"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M42,22.3c-2.8-1.1-3.2-2.2-3.2-3.3s0.8-2.2,1.8-3c1.7-1.4,2.6-3.5,2.6-5.8c0-4.4-2.9-8.2-8-8.2 c-4.7,0-7.5,3.2-7.9,7.1c0,0.4,0.2,0.7,0.5,0.9c3.8,2.4,6.1,6.6,6.1,11.7c0,3.8-1.5,7.2-4.2,9.6c-0.2,0.2-0.2,0.6,0,0.8 c0.7,0.5,2.3,1.2,3.3,1.7c0.3,0.1,0.5,0.2,0.8,0.2h12.1c2.3,0,4.1-1.9,4.1-4v-0.6C50,25.9,46.2,24,42,22.3z"></path> <path d="M28.6,36.2c-3.4-1.4-3.9-2.6-3.9-3.9c0-1.3,1-2.6,2.1-3.6c2-1.7,3.1-4.1,3.1-6.9c0-5.2-3.4-9.7-9.6-9.7 c-6.1,0-9.6,4.5-9.6,9.7c0,2.8,1.1,5.2,3.1,6.9c1.1,1,2.1,2.3,2.1,3.6c0,1.3-0.5,2.6-4,3.9c-5,2-9.9,4.3-9.9,8.5V45v1 c0,2.2,1.8,4,4.1,4h27.7c2.3,0,4.2-1.8,4.2-4v-1v-0.4C38,40.5,33.6,38.2,28.6,36.2z"></path> </g> </g></svg>
                                    <div className={styles.navLabel}>Connections</div>
                                </div>
                            </Link>
                        </li>
                        <li className={
                            path == 'profile' ? 
                                `${styles.selected} ${styles.profile}` : 
                                styles.profile
                        }>
                            <Link to="/profile">
                                <div>
                                    <img aria-label="Profile" src="/defaultPfp.webp" alt="Profile" className="profile"/>
                                    <div className={styles.navLabel}>Profile</div>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}