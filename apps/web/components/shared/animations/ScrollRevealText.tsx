'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ScrollRevealText.module.css'

interface ScrollRevealTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export default function ScrollRevealText({
  children,
  className = '',
  delay = 0,
  as: Component = 'h2'
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px',
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <Component
      ref={ref as React.RefObject<HTMLElement>['current']}
      className={`${styles.scrollRevealText} ${isVisible ? styles.visible : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        '--reveal-delay': `${delay}ms`
      } as React.CSSProperties & { '--reveal-delay': string }}
    >
      <span className={styles.inner} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </span>
    </Component>
  )
}
