"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import styles from "./Hero.module.css"
import LoadingScreen from "../LoadingScreen"
import { setSlowScroll, setNormalScroll } from "../SmoothScroll"

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

// Generate frame paths
const getFramePath = (frameIndex: number) => {
  const frameNumber = FRAME_START + frameIndex
  const paddedNumber = String(frameNumber).padStart(5, '0')
  return `/banner/frames/Web%20image%20${paddedNumber}.jpg`
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const stickyWrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleSubRef = useRef<HTMLSpanElement>(null)
  const logosRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
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

      // Draw first frame with proper dimensions
      const canvas = canvasRef.current
      if (canvas && loadedImages[0]) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Set canvas to viewport dimensions
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          canvas.style.width = '100%'
          canvas.style.height = '100%'

          // Draw first frame with proper aspect ratio
          drawImageCover(ctx, loadedImages[0], canvas.width, canvas.height)
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
    if (!heroRef.current || !stickyWrapperRef.current || !imagesLoaded) return

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
  }, [imagesLoaded])

  // Handle window resize to update canvas dimensions
  useEffect(() => {
    if (!canvasRef.current || !imagesLoaded) return

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
  }, [imagesLoaded])

  return (
    <>
      {/* Loading Screen - placed outside hero section */}
      <LoadingScreen progress={loadingProgress} isComplete={imagesLoaded} />

      <section ref={heroRef} className={styles.hero}>
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
