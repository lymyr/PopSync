import { Link, useNavigate } from "react-router";
import FormContainer from "./components/FormContainer";
import styles from "./Register.module.css"
import { useContext, useEffect, useState } from "react";
import handleRegister from "../../features/auth/handlers/handleRegister";
import UserContext from "../../features/auth/contexts/UserContext";
import removeNullType from "../../features/auth/utils/removeNullType";

export type RegisterError = 
    undefined |
    {
        username: {msg: string};
        password: {msg: string};
        confirmPassword: {msg: string};
    } |
    string

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    })

    const nav = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<RegisterError>()

    const {user} = removeNullType(useContext(UserContext))
    useEffect(() => {
        if (user != null)
            nav('/')
    }, [user, nav])

    return (
        <FormContainer>
            <form 
                className={styles.container}
                onSubmit={(e) => {
                    handleRegister(e, formData, nav, setLoading, setError)
                }}
            >
                <p className={styles.title}>Create an account</p>
                <div className={styles.formContainer}>
                    <div className={styles.inputLabel}>
                        <label htmlFor="username">Username</label>
                        <input 
                            id="username" 
                            name="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                        { typeof error == "object" && error?.username && 
                            <p className="error-text">{error.username.msg}</p>
                        }
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
                        { typeof error == "object" && error?.password && 
                            <p className="error-text">{error.password.msg}</p>
                        }
                    </div>
                    <div className={styles.inputLabel}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        { typeof error == "object" && error?.confirmPassword && 
                            <p className="error-text">{error.confirmPassword.msg}</p>
                        }
                        {typeof error == "string" && <p className="error-text">{error}</p>}
                    </div>
                </div>
                <button 
                    disabled={loading}
                    className={`actionBtn ${styles.button}`}
                >Register</button>

                <p>Already have an account? Sign in <Link to={"/login"}>here</Link></p>
            </form>
        </FormContainer>
    )
}