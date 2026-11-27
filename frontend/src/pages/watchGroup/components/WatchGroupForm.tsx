import styles from "./WatchGroupForm.module.css"

export default function WatchGroupForm() {
    return (
        <form className={styles.container}>
            <div>
                <div>
                    <label htmlFor="groupName">Group Name</label>
                    <input id="groupName"/>
                </div>
            </div>
            <div>
                <div>
                    <label htmlFor="targetMedia">Target Media</label>
                    <input id="targetMedia"/>
                </div>
                <section>
                    <h3>Selected Media</h3>
                    <ul>
                        insert selected shows/movies here with remove button
                    </ul>
                </section>
            </div>
            <div>
                <div>
                    <label htmlFor="searchUser">Target Media</label>
                    <input id="searchUser" />
                </div>
                <section>
                    <h3>Added Users</h3>
                    <ul>
                        insert added users here with remove button
                    </ul>
                </section>
            </div>
            <button className="actionBtn">Create Group</button>
        </form>
    )
}