import { Link } from "react-router";
import FormContainer from "../components/FormContainer";
import styles from "./Login.module.css"

export default function Login() {
    return (
        <FormContainer>
            <form className={styles.container}>
                <p className={styles.title}>Welcome!</p>
                <div className={styles.formContainer}>
                    <div className={styles.inputLabel}>
                        <label htmlFor="username">Username</label>
                        <input id="username" name="username"/>
                    </div>
                    <div className={styles.inputLabel}>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password"/>
                    </div>
                </div>
                <div className={styles.btnContainer}>
                    <button>Guest</button>
                    <button className={`actionBtn ${styles.button}`}>Login</button>
                </div>
                <p>Don't have an account yet? Sign up <Link to={"/register"}>here</Link></p>
            </form>
        </FormContainer>
    )
}