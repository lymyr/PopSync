import { Link } from "react-router";
import FormContainer from "../components/FormContainer";
import styles from "./Register.module.css"

export default function Register() {
    return (
        <FormContainer>
            <form className={styles.container}>
                <p className={styles.title}>Create an account</p>
                <div className={styles.formContainer}>
                    <div className={styles.inputLabel}>
                        <label htmlFor="username">Username</label>
                        <input id="username" name="username"/>
                    </div>
                    <div className={styles.inputLabel}>
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password"/>
                    </div>
                    <div className={styles.inputLabel}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" name="confirmPassword" type="password"/>
                    </div>
                </div>

                <button className={`actionBtn ${styles.button}`}>Register</button>

                <p>Already have an account? Sign in <Link to={"/login"}>here</Link></p>
            </form>
        </FormContainer>
    )
}