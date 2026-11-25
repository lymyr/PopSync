import { Link, useNavigate } from "react-router";
import FormContainer from "../components/FormContainer";
import styles from "./Login.module.css"
import { useContext, useEffect, useState } from "react";
import handleLogin from "../handlers/handleLogin";
import UserContext from "../../../contexts/UserContext";
import removeNullType from "../../../utils/removeNullType";

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    const nav = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<undefined | string>()
    const {user, setUser} = removeNullType(useContext(UserContext))

    useEffect(() => {
        if (user != null)
            nav('/')
    }, [user, nav])
    
    return (
        <FormContainer>
            <form 
                className={styles.container}
                onSubmit={(e) => {
                    handleLogin(e, formData, nav, setLoading, setError, setUser)
                }}
            >
                <p className={styles.title}>Welcome!</p>
                <div className={styles.formContainer}>
                    <div className={styles.inputLabel}>
                        <label htmlFor="username">Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                    <div className={styles.inputLabel}>
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        { typeof error == "string" &&
                            <p className="error-text">{error}</p>
                        }
                    </div>
                </div>
                <div className={styles.btnContainer}>
                    <button 
                        disabled={loading} 
                        type="button"
                    >
                        Guest
                    </button>
                    <button className={`actionBtn ${styles.button}`} disabled={loading}>Login</button>
                </div>
                <p>Don't have an account yet? Sign up <Link to={"/register"}>here</Link></p>
            </form>
        </FormContainer>
    )
}