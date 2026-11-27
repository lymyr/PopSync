import BrandLogo from "../../../components/BrandLogo"
import styles from "./FormContainer.module.css"

type props = {
    children: React.JSX.Element,
}

export default function FormContainer({children}: props) {
    return (
        <div className={styles.container}>
            <div>
                {children}
            </div>
            <div>
                <BrandLogo />
            </div>
        </div>
    )
}