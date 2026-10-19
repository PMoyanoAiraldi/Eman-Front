import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import styles from "../../styles/InfoPage.module.css";

const AboutUs = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Breadcrumb items={[
                    { label: 'Inicio', path: '/' }, 
                    { label: 'Nosotros' }]} 
                />

            </div>
        </div>
    );
};

export default AboutUs;