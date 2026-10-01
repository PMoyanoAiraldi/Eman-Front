import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import styles from './Hero.module.css'

const Hero = () => {
    const [slides, setSlides] = useState([])
    const [current, setCurrent] = useState(0)
    const touchStartX = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        axiosInstance.get('/media_content/by-type', { 
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

    const prev = useCallback(() => {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])


    // Autoplay: se reinicia cada vez que cambia el slide (manual o automático)
    useEffect(() => {
        if (slides.length <= 1) return
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [slides.length, next, current])

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        touchStartX.current = null
        if (Math.abs(diff) < 50) return // ignora toques y movimientos chicos
        if (diff > 0) next()
        else prev()
    }


    if (slides.length === 0) return null

    return (
        <section 
            className={styles.hero}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >

        <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
            {slides.map((slide) => (
            <div className={styles.slide} key={slide.id}>
             <div className={styles.content} key={current}>{/* key: {current} -  remonta el texto para que se repitan las animaciones */}
                <span className={styles.tag}>{slide.tag}</span>
                <p className={styles.subtitle}>{slide.subtitle}</p> 
                <h1 className={styles.title}>{slide.title}</h1>
                <button 
                className={styles.btn} onClick={() => navigate(slide.ctaUrl)}>
                {slide.ctaText}
                </button>
            </div>

        <div className={styles.imageWrapper}>
                <img 
                    src={slide.url} 
                    alt={slide.altText || slide.tag || 'Eman'} 
                    style={{ objectPosition: slide.focalPoint || 'center center' }}
                    />
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