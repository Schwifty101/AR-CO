"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import styles from "./LogoCarousel.module.css"

const logos = [
  "ary-logo.png",
  "askariBank-logo.png",
  "audi-logo.png",
  "bol-logo.png",
  "DHA-Logo.png",
  "mcb-logo.png",
  "nitb-logo.png",
  "ptcl-logo.png",
  "QAU-Logo.png",
  "TenSports-logo.png",
  "Tullow-logo.png",
  "ufone-logo.png",
  "westminister-logo.png",
]

export default function LogoCarousel() {
  const [isVisible, setIsVisible] = useState(false)
  const [firstRowOffset, setFirstRowOffset] = useState(-1200)
  const [secondRowOffset, setSecondRowOffset] = useState(-1200)
  const sectionRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  
  // Scroll lock state
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const lockScrollY = useRef(0)
  const consumedScroll = useRef(0)
  const canTrigger = useRef(true)
  const MAX_CONSUMED_SCROLL = typeof window !== 'undefined' ? window.innerHeight * 3 : 3000

  // Check if section is at viewport center
  useEffect(() => {
    const checkPosition = () => {
      if (!sectionRef.current) return
      
      const rect = sectionRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const sectionMiddle = rect.top + rect.height / 2
      
      // Section is at viewport center
      const isAtCenter = sectionMiddle >= viewportHeight * 0.4 && sectionMiddle <= viewportHeight * 0.6
      
      // Section is outside the trigger zone
      const isOutsideZone = sectionMiddle < viewportHeight * 0.3 || sectionMiddle > viewportHeight * 0.7
      
      if (isAtCenter && !isScrollLocked && canTrigger.current) {
        // Enter scroll lock mode
        setIsVisible(true)
        setIsScrollLocked(true)
        lockScrollY.current = window.scrollY
        consumedScroll.current = 0
        canTrigger.current = false
      }
      
      // Reset trigger when section leaves the active zone
      if (isOutsideZone && !isScrollLocked) {
        canTrigger.current = true
      }
    }
    
    window.addEventListener('scroll', checkPosition, { passive: true })
    checkPosition() // Check on mount
    
    return () => window.removeEventListener('scroll', checkPosition)
  }, [isScrollLocked, isVisible])

  // Wheel event handler for scroll hijacking
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isScrollLocked) return
      
      // Prevent default scroll behavior
      e.preventDefault()
      
      const deltaY = e.deltaY
      
      // Track consumed scroll
      consumedScroll.current += Math.abs(deltaY)
      
      // Convert vertical scroll to horizontal logo movement
      const horizontalDelta = deltaY * 0.8
      
      setFirstRowOffset(prev => prev + horizontalDelta)
      setSecondRowOffset(prev => prev - horizontalDelta)
      
      // Check if threshold reached
      if (consumedScroll.current >= MAX_CONSUMED_SCROLL) {
        setIsScrollLocked(false)
        // Allow page to continue scrolling
        window.scrollTo(0, lockScrollY.current + 100)
      }
    }
    
    if (isScrollLocked) {
      // Lock scroll position
      const lockScroll = () => {
        if (isScrollLocked) {
          window.scrollTo(0, lockScrollY.current)
        }
      }
      
      window.addEventListener('wheel', handleWheel, { passive: false })
      window.addEventListener('scroll', lockScroll, { passive: true })
      
      return () => {
        window.removeEventListener('wheel', handleWheel)
        window.removeEventListener('scroll', lockScroll)
      }
    }
  }, [isScrollLocked, MAX_CONSUMED_SCROLL])

  // Split logos into two rows - 7 and 6
  const firstRow = logos.slice(0, 7)
  const secondRow = logos.slice(7)

  return (
    <section 
      ref={sectionRef}
      className={`${styles.logoSection} ${isVisible ? styles.visible : ''} ${isScrollLocked ? styles.locked : ''}`}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Trusted by Leading Organizations</h1>
        
        <div className={styles.carouselWrapper}>
          {/* First Row - Moving Right (starts from left) */}
          <div className={styles.logoRow}>
            <div 
              className={styles.logoTrack}
              style={{ transform: `translateX(${firstRowOffset}px)` }}
            >
              {[...firstRow, ...firstRow, ...firstRow].map((logo, index) => (
                <div key={`first-${index}`} className={styles.logoItem}>
                  <Image
                    src={`/client-logos/${logo}`}
                    alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                    width={200}
                    height={100}
                    className={styles.logoImage}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Left (starts from right) */}
          <div className={styles.logoRow}>
            <div 
              className={`${styles.logoTrack} ${styles.reverse}`}
              style={{ transform: `translateX(${secondRowOffset}px)` }}
            >
              {[...secondRow, ...secondRow, ...secondRow].map((logo, index) => (
                <div key={`second-${index}`} className={styles.logoItem}>
                  <Image
                    src={`/client-logos/${logo}`}
                    alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                    width={200}
                    height={100}
                    className={styles.logoImage}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
