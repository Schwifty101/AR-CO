"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import styles from "./Hero.module.css"
import LoadingScreen from "../../LoadingScreen"
import { setSlowScroll } from "../../SmoothScroll"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'du5famewu'
const INITIAL_LOAD_COUNT = 100 // Load first 100 images before showing content

// Generate frame paths from Cloudinary
// Images available: Web_image_01000 through Web_image_01517
const getFramePath = (frameIndex: number) => {
  const frameNumber = FRAME_START + frameIndex
  const paddedNumber = String(frameNumber).padStart(5, '0')
  // f_auto = auto format, q_auto = auto quality optimization
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/Web_image_${paddedNumber}`
}

const FRAMES_LOADED_KEY = 'arco_frames_loaded'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const stickyWrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleSubRef = useRef<HTMLSpanElement>(null)
  const logosRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  // Always start with loading screen to avoid hydration mismatch.
  // sessionStorage check happens in useEffect after hydration.
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [initialImagesLoaded, setInitialImagesLoaded] = useState(false) // First 100 images
  const [allImagesLoaded, setAllImagesLoaded] = useState(false) // All 518 images
  const [loadingProgress, setLoadingProgress] = useState(0)
  // Track if this is a cached visit for fast animation (separate from skipping)
  const [isCachedVisit, setIsCachedVisit] = useState(false)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  // Frame range for UI element fade (frames 10-30 for smooth transition)
  const UI_FADE_START_FRAME = 10
  const UI_FADE_END_FRAME = 30

  // Helper function to draw image with proper aspect ratio (object-fit: cover behavior)
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const imgAspect = img.width / img.height
    const canvasAspect = canvasWidth / canvasHeight

    let drawWidth, drawHeight, offsetX, offsetY

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - fit to height
      drawHeight = canvasHeight
      drawWidth = img.width * (canvasHeight / img.height)
      offsetX = (canvasWidth - drawWidth) / 2
      offsetY = 0
    } else {
      // Image is taller than canvas - fit to width
      drawWidth = canvasWidth
      drawHeight = img.height * (canvasWidth / img.width)
      offsetX = 0
      offsetY = (canvasHeight - drawHeight) / 2
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }

  // Check sessionStorage after hydration to detect cached visits
  // Loading screen always shows, but completes quickly when cached
  useEffect(() => {
    if (sessionStorage.getItem(FRAMES_LOADED_KEY)) {
      setIsCachedVisit(true)
    }
  }, [])

  // Fast progress animation for cached visits (~1.5 seconds)
  // Browser will load images from cache while animation plays
  useEffect(() => {
    if (!isCachedVisit || initialImagesLoaded) return

    let progress = 0
    const targetDuration = 1500 // 1.5 seconds total
    const steps = 30 // Number of steps for smooth animation
    const stepInterval = targetDuration / steps
    const stepIncrement = 100 / steps

    const interval = setInterval(() => {
      progress += stepIncrement
      const clampedProgress = Math.min(Math.round(progress), 100)
      setLoadingProgress(clampedProgress)

      if (clampedProgress >= 100) {
        clearInterval(interval)
      }
    }, stepInterval)

    return () => clearInterval(interval)
  }, [isCachedVisit, initialImagesLoaded])

  // Preload frames: First 100 for initial load, then rest in background
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = new Array(TOTAL_FRAMES)
      let loadedCount = 0

      // Helper to load a single image
      const loadImage = (index: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => {
            loadedImages[index] = img
            loadedCount++

            // Update progress based on initial load count (first 100 images = 100%)
            if (loadedCount <= INITIAL_LOAD_COUNT) {
              setLoadingProgress(Math.floor((loadedCount / INITIAL_LOAD_COUNT) * 100))
            }

            // Mark initial load complete after first 100 images
            if (loadedCount === INITIAL_LOAD_COUNT) {
              imagesRef.current = loadedImages
              setInitialImagesLoaded(true)

              // Draw first frame
              const canvas = canvasRef.current
              if (canvas && loadedImages[0]) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  canvas.width = window.innerWidth
                  canvas.height = window.innerHeight
                  canvas.style.width = '100%'
                  canvas.style.height = '100%'
                  drawImageCover(ctx, loadedImages[0], canvas.width, canvas.height)
                }
              }
            }

            // Mark all images loaded
            if (loadedCount === TOTAL_FRAMES) {
              setAllImagesLoaded(true)
              sessionStorage.setItem(FRAMES_LOADED_KEY, 'true')
              console.log('✅ All frames loaded in background')
            }

            resolve()
          }
          img.onerror = () => {
            console.error(`Failed to load frame ${index}`)
            reject()
          }
          img.src = getFramePath(index)
        })
      }

      // Load first 100 images sequentially in small batches for smooth progress
      const batchSize = 5
      for (let i = 0; i < INITIAL_LOAD_COUNT; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, INITIAL_LOAD_COUNT); j++) {
          batch.push(loadImage(j))
        }
        try {
          await Promise.all(batch)
        } catch (error) {
          console.error('Error loading initial frames:', error)
        }
      }

      // Load remaining images in background (fire and forget, no await between images)
      console.log('🔄 Loading remaining frames in background...')
      for (let i = INITIAL_LOAD_COUNT; i < TOTAL_FRAMES; i++) {
        loadImage(i).catch(() => { }) // Fire and forget

        // Small delay every 20 images to avoid overwhelming the browser
        if ((i - INITIAL_LOAD_COUNT) % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
    }

    loadImages()
  }, [])

  // Helper function to update UI elements based on current frame (not scroll progress)
  // This ensures smooth fade tied to actual frame playback, not scroll position
  const updateUIElements = (currentFrame: number) => {
    // Calculate opacity based on frame range (fully visible until frame 10, fully hidden after frame 30)
    let opacity = 1
    if (currentFrame >= UI_FADE_END_FRAME) {
      opacity = 0
    } else if (currentFrame > UI_FADE_START_FRAME) {
      // Linear interpolation between start and end frames
      opacity = 1 - (currentFrame - UI_FADE_START_FRAME) / (UI_FADE_END_FRAME - UI_FADE_START_FRAME)
    }

    // Apply smooth easing to opacity for more natural feel
    const easedOpacity = opacity * opacity * (3 - 2 * opacity) // smoothstep easing

    // Title opacity
    if (titleContainerRef.current) {
      titleContainerRef.current.style.opacity = String(easedOpacity)
      titleContainerRef.current.style.visibility = easedOpacity > 0.01 ? 'visible' : 'hidden'
    }

    // Subtitle opacity (same timing as title)
    if (titleSubRef.current) {
      titleSubRef.current.style.opacity = String(easedOpacity)
      titleSubRef.current.style.visibility = easedOpacity > 0.01 ? 'visible' : 'hidden'
    }

    // Logos opacity (same timing for consistency)
    if (logosRef.current) {
      logosRef.current.style.opacity = String(easedOpacity)
      logosRef.current.style.visibility = easedOpacity > 0.01 ? 'visible' : 'hidden'
    }

    // Overlay opacity
    if (overlayRef.current) {
      overlayRef.current.style.opacity = String(easedOpacity)
    }
  }

  // ScrollTrigger setup - direct frame rendering from smoothed scroll progress
  useGSAP(() => {
    if (!heroRef.current || !stickyWrapperRef.current || !initialImagesLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: stickyWrapperRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      pinReparent: true,
      scrub: true, // Enable scrub - ScrollSmoother will handle the smoothing
      // markers: true,

      // Slow down scroll when entering hero section for smooth frame playback
      // Note: onLeave/onLeaveBack removed to prevent momentum burst between sections
      // QuoteSection immediately takes over scroll speed control via its own handlers
      onEnter: () => setSlowScroll(),
      onEnterBack: () => setSlowScroll(),

      onUpdate: (self) => {
        // Calculate frame directly from scroll progress
        // ScrollSmoother's normalizeScroll + smooth settings handle acceleration smoothing
        const frame = Math.floor(self.progress * (TOTAL_FRAMES - 1))

        // Only render if frame changed (prevents unnecessary redraws)
        if (frame !== currentFrameRef.current && imagesRef.current[frame]) {
          currentFrameRef.current = frame
          drawImageCover(ctx, imagesRef.current[frame], canvas.width, canvas.height)

          // Update UI elements based on frame
          updateUIElements(frame)
        }
      },
    })

    scrollTriggerRef.current = st

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [initialImagesLoaded])

  // Handle window resize to update canvas dimensions
  useEffect(() => {
    if (!canvasRef.current || !initialImagesLoaded) return

    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        canvas.style.width = '100%'
        canvas.style.height = '100%'

        // Redraw current frame
        const ctx = canvas.getContext('2d')
        const frameToRender = Math.round(currentFrameRef.current)
        if (ctx && imagesRef.current[frameToRender]) {
          drawImageCover(ctx, imagesRef.current[frameToRender], canvas.width, canvas.height)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialImagesLoaded])

  // Loading is complete when either:
  // - First 100 frames loaded (first visit)
  // - Fast animation completed for cached visit (progress reached 100%)
  const isLoadingComplete = initialImagesLoaded || (isCachedVisit && loadingProgress >= 100)

  return (
    <>
      {/* Loading Screen - always shown on home page, completes quickly when cached */}
      {showLoadingScreen && (
        <LoadingScreen progress={loadingProgress} isComplete={isLoadingComplete} />
      )}

      <section ref={heroRef} data-hero-section="true" className={styles.hero}>
        {/* Sticky wrapper keeps content visible while scrolling */}
        <div ref={stickyWrapperRef} className={styles.stickyWrapper}>
          {/* Frame-based Background */}
          <div ref={videoContainerRef} className={styles.videoContainer}>
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
