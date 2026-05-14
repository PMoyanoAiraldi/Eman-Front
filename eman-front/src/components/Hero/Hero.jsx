import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './Hero.module.css'

const Hero = () => {
    const [slides, setSlides] = useState([])
    const [current, setCurrent] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('http://localhost:3010/media_content/by-type', { 
            params: { type: 'hero' } 
        })
            .then(res => {
                if ( res.data?.length > 0) {
                    const sorted = [...res.data].sort((a, b) => a.order - b.order)
                    setSlides(sorted)
                }
            })
            .catch(err => console.error('Error al cargar imagen hero:', err))
        }, [])

    const next = useCallback(() => {
        setCurrent(prev => (prev + 1) % slides.length)
    }, [slides.length])

    const prev = () => {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length)
    }

    useEffect(() => {
        if (slides.length <= 1) return
            const timer = setInterval(next, 5000)
            return () => clearInterval(timer)
        }, [slides.length, next])

        if (slides.length === 0) return null

    return (
        <section className={styles.hero}>

        <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
            {slides.map((slide) => (
            <div className={styles.slide} key={slide.id}>
            <div className={styles.content}>
                <span className={styles.tag}>{slide.tag}</span>
                <p className={styles.subtitle}>{slide.subtitle}</p> 
                <h1 className={styles.title}>{slide.title}</h1>
                <button 
                className={styles.btn} onClick={() => navigate(slide.ctaUrl)}>
                {slide.ctaText}
                </button>
            </div>

        <div className={styles.imageWrapper}>
                <img src={slide.url} alt={slide.altText || slide.tag || 'Eman'} />
            </div>
            </div>
        ))}
        </div>
        
        {slides.length > 1 && (
            <div className={styles.controls}>
            <button className={styles.arrow} onClick={prev} aria-label="Anterior">‹</button>
            <div className={styles.dots}>
            {slides.map((_, i) => (
                <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                />
            ))}
            </div>
            <button className={styles.arrow} onClick={next} aria-label="Siguiente">›</button>
        </div>
        )}
        </section>
    )
}

export default Hero