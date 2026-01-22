"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import styles from "./Hero.module.css"
import LoadingScreen from "../LoadingScreen"

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

const TOTAL_FRAMES = 772
const FRAME_START = 1000

// Generate frame paths
const getFramePath = (frameIndex: number) => {
  const frameNumber = FRAME_START + frameIndex
  const paddedNumber = String(frameNumber).padStart(5, '0')
  return `/banner/frames/Web%20image%20${paddedNumber}.jpg`
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleSubRef = useRef<HTMLSpanElement>(null)
  const logosRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)

  // Preload all frames with progress tracking
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = []
      let loadedCount = 0
      
      // Load images one batch at a time for smoother progress
      const batchSize = 10
      
      for (let i = 0; i < TOTAL_FRAMES; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, TOTAL_FRAMES); j++) {
          const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image()
            img.onload = () => {
              loadedCount++
              setLoadingProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100))
              resolve(img)
            }
            img.onerror = reject
            img.src = getFramePath(j)
          })
          batch.push(promise)
        }
        
        try {
          const batchResults = await Promise.all(batch)
          loadedImages.push(...batchResults)
        } catch (error) {
          console.error('Error loading frames:', error)
        }
      }

      imagesRef.current = loadedImages
      setImagesLoaded(true)
      
      // Draw first frame
      const canvas = canvasRef.current
      if (canvas && loadedImages[0]) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = loadedImages[0].width
          canvas.height = loadedImages[0].height
          ctx.drawImage(loadedImages[0], 0, 0)
        }
      }
    }

    loadImages()
  }, [])

  // Scroll-based frame playback and UI updates
  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const titleContainer = titleContainerRef.current
    const titleSub = titleSubRef.current
    const logos = logosRef.current
    const overlay = overlayRef.current
    if (!hero || !canvas || !imagesLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const heroHeight = hero.offsetHeight
      const maxScroll = heroHeight - window.innerHeight

      // Calculate scroll progress (0 to 1)
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1)

      // Calculate which frame to show (0 to TOTAL_FRAMES - 1)
      const frameIndex = Math.min(
        Math.floor(progress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      )
      
      if (frameIndex !== currentFrameRef.current && imagesRef.current[frameIndex]) {
        currentFrameRef.current = frameIndex
        ctx.drawImage(imagesRef.current[frameIndex], 0, 0)
      }

      // Update title - just fade out, no movement
      if (titleContainer) {
        const opacity = Math.max(0, 1 - progress * 3)
        titleContainer.style.opacity = String(opacity)
        titleContainer.style.visibility = opacity > 0 ? 'visible' : 'hidden'
      }

      // Update subtitle opacity
      if (titleSub) {
        const subOpacity = Math.max(0, 1 - progress * 3)
        titleSub.style.opacity = String(subOpacity)
        titleSub.style.visibility = subOpacity > 0 ? 'visible' : 'hidden'
      }

      // Update logos opacity
      if (logos) {
        const logosOpacity = Math.max(0, 1 - progress * 5)
        logos.style.opacity = String(logosOpacity)
        logos.style.visibility = logosOpacity > 0 ? 'visible' : 'hidden'
      }

      // Update overlay opacity
      if (overlay) {
        const overlayOpacity = Math.max(0, 1 - progress * 3)
        overlay.style.opacity = String(overlayOpacity)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [imagesLoaded])

  return (
    <>
      {/* Loading Screen - placed outside hero section */}
      <LoadingScreen progress={loadingProgress} isComplete={imagesLoaded} />

      <section ref={heroRef} className={styles.hero}>
        {/* Sticky wrapper keeps content visible while scrolling */}
        <div className={styles.stickyWrapper}>
          {/* Frame-based Background */}
          <div className={styles.videoContainer}>
            <canvas
              ref={canvasRef}
              className={styles.video}
            />
            <div 
              ref={overlayRef}
              className={styles.videoOverlay} 
            />
          </div>

          {/* Hero Content */}
          <div className={styles.contentWrapper}>
            <div 
              ref={titleContainerRef}
              className={styles.titleContainer}
            >
              <h1 className={styles.title}>
                AR&CO
                <span 
                  ref={titleSubRef}
                  className={styles.titleSub}
                >
                  Law Associates
                </span>
              </h1>
            </div>

            {/* Client Logos Section */}
            <div 
              ref={logosRef}
              className={styles.trustedBy}
            >
         

          <div className={styles.logoScrollContainer}>
            <div className={styles.logoScroll}>
              {/* First set of logos */}
              <div className={styles.logoSet}>
                {logos.map((logo, index) => (
                  <div key={`a-${index}`} className={styles.logoItem}>
                    <Image
                      src={`/client-logos/${logo}`}
                      alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                      width={120}
                      height={60}
                      className={styles.logoImage}
                      priority
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className={styles.logoSet}>
                {logos.map((logo, index) => (
                  <div key={`b-${index}`} className={styles.logoItem}>
                    <Image
                      src={`/client-logos/${logo}`}
                      alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                      width={120}
                      height={60}
                      className={styles.logoImage}
                      priority
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
    </>
  )
}
