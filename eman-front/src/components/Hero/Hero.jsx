// components/Hero/Hero.jsx
import styles from './Hero.module.css'

const Hero = () => {
    return (
        <section className={styles.hero}>
        <div className={styles.content}>
            <span className={styles.tag}>Nueva Colección</span>
            <h1 className={styles.title}>
            Tu mejor <br />
            <em>version.</em>
            </h1>
            <button className={styles.btn}>Explorar</button>
        </div>
        <div className={styles.imageWrapper}>
            <img src="../../assets/Hero.jpg" alt="Nueva colección Eman" />
        </div>
        </section>
    )
}

export default Hero