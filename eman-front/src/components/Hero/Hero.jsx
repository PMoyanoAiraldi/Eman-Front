import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './Hero.module.css'

const Hero = () => {
    const [heroImage, setHeroImage] = useState(null)

        useEffect(() => {
            axios.get('http://localhost:3010/media_content/by-type', { 
                params: { type: 'hero' } 
            })
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setHeroImage(res.data[0])  // ← guardamos la primera imagen hero
                    }
                })
                .catch(err => console.error('Error al cargar imagen hero:', err))
            }, [])

    return (
        <section className={styles.hero}>
        <div className={styles.content}>
            <span className={styles.tag}>Nueva Colección</span>
            <p className={styles.subtitle}>Moda que te define</p> 
            <h1 className={styles.title}>
            Tu mejor <br />
            <em>version.</em>
            </h1>
            <button className={styles.btn}>Explorar</button>
        </div>
        <div className={styles.imageWrapper}>
                {heroImage ? (
                    <img src={heroImage.url} alt={heroImage.altText || 'Nueva colección Eman'} />
                ) : (
                    <img src="/assets/Hero.jpg" alt="Nueva colección Eman" /> // fallback
                )}
            </div>
        </section>
    )
}

export default Hero