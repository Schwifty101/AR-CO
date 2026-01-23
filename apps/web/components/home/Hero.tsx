"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import styles from "./Hero.module.css"
import LoadingScreen from "../LoadingScreen"
import { setSlowScroll, setNormalScroll, getSmoother } from "../SmoothScroll"

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
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const titleSubRef = useRef<HTMLSpanElement>(null)
  const logosRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
  const heroEndPositionRef = useRef<number>(0)
  const isBlockingScrollRef = useRef<boolean>(false)
  const debugOverlayRef = useRef<HTMLDivElement>(null)
  
  // Frame rate limiting: max frames per second regardless of scroll speed
  const MAX_FRAMES_PER_SECOND = 90  // 772 frames at 90fps = ~8.6 seconds total
  const FRAME_INTERVAL = 1000 / MAX_FRAMES_PER_SECOND
  
  // How many frames behind before we block scrolling past hero
  const FRAME_LAG_THRESHOLD = 25
  
  // Frame range for UI element fade (frames 10-30 for smooth transition)
  const UI_FADE_START_FRAME = 10
  const UI_FADE_END_FRAME = 30

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

          // Draw first frame to fill canvas
          ctx.drawImage(loadedImages[0], 0, 0, canvas.width, canvas.height)
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

  // ScrollTrigger setup - velocity-clamped frame interpolation
  useGSAP(() => {
    if (!heroRef.current || !stickyWrapperRef.current || !imagesLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Frame interpolation loop - advances at constant rate toward target
    const interpolateFrames = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = timestamp - lastTimeRef.current
      
      // Only advance frame if enough time has passed (rate limiting)
      if (deltaTime >= FRAME_INTERVAL) {
        lastTimeRef.current = timestamp
        
        const current = currentFrameRef.current
        const target = targetFrameRef.current
        
        // Move one frame closer to target (constant speed)
        if (current !== target && imagesRef.current[current]) {
          const direction = target > current ? 1 : -1
          const nextFrame = current + direction

          currentFrameRef.current = nextFrame
          ctx.drawImage(
            imagesRef.current[nextFrame],
            0, 0,
            canvas.width,
            canvas.height
          )

          // Update UI based on current rendered frame
          updateUIElements(nextFrame)
        }

        // Update debug overlay
        if (debugOverlayRef.current) {
          const frameLag = target - current
          debugOverlayRef.current.innerHTML = `
            <div style="
              position: fixed; 
              top: 10px; 
              left: 10px; 
              z-index: 10000; 
              background: rgba(0, 0, 0, 0.8); 
              color: #00ff00; 
              padding: 10px; 
              font-family: monospace; 
              border-radius: 4px; 
              pointer-events: none;
            ">
              <div style="margin-bottom: 4px;"><strong>Current Frame:</strong> ${current} / ${TOTAL_FRAMES - 1}</div>
              <div style="margin-bottom: 4px;"><strong>Target Frame:</strong> ${target} / ${TOTAL_FRAMES - 1}</div>
              <div style="margin-bottom: 4px;"><strong>Frame Lag:</strong> ${frameLag}</div>
              <div><strong>Blocking:</strong> ${isBlockingScrollRef.current ? 'YES' : 'NO'}</div>
            </div>
          `;
        }
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(interpolateFrames)
    }
    
    // Start the interpolation loop
    animationFrameRef.current = requestAnimationFrame(interpolateFrames)

    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: stickyWrapperRef.current,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      pinReparent: true,
      // markers: true,
      
      // Dynamic scroll sensitivity
      onEnter: () => setSlowScroll(),
      onEnterBack: () => setSlowScroll(),
      onLeaveBack: () => setNormalScroll(),
      
      onUpdate: (self) => {
        // Store the end position of the hero section
        heroEndPositionRef.current = self.end
        
        // Only update target frame - the interpolation loop handles rendering
        targetFrameRef.current = Math.floor(self.progress * (TOTAL_FRAMES - 1))
        
        const smoother = getSmoother()
        const currentFrame = currentFrameRef.current
        const targetFrame = targetFrameRef.current
        const frameLag = targetFrame - currentFrame
        
        // Calculate what percentage of frames have been rendered
        const frameCompletionPercent = (currentFrame / (TOTAL_FRAMES - 1)) * 100
        
        // CRITICAL: Block scroll if we're past 85% scroll progress AND frames haven't caught up
        // This runs on EVERY scroll update, so it catches fast scrolling
        if (self.progress > 0.85 && frameCompletionPercent < 95) {
          // Calculate max allowed progress based on current frame completion
          const frameCompletionRatio = currentFrame / (TOTAL_FRAMES - 1)
          // Allow scroll to be slightly ahead of frames, but not too far
          const maxAllowedProgress = Math.min(frameCompletionRatio + 0.08, 0.99)
          
          if (self.progress > maxAllowedProgress && smoother) {
            // Clamp scroll position to match frame progress
            const clampedPosition = self.start + (self.end - self.start) * maxAllowedProgress
            smoother.scrollTo(clampedPosition, false)
            isBlockingScrollRef.current = true
          } else {
            isBlockingScrollRef.current = false
          }
        } else if (frameCompletionPercent >= 95) {
          // Once 95% of frames are complete, allow free scrolling to exit
          isBlockingScrollRef.current = false
          if (self.progress > 0.95) {
            setNormalScroll()
          }
        }
      },
      
      onLeave: () => {
        // Allow normal scroll when leaving
        setNormalScroll()
        isBlockingScrollRef.current = false
      },
    })
    
    scrollTriggerRef.current = st

    return () => {
      // Clean up animation frame loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
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
          ctx.drawImage(
            imagesRef.current[frameToRender],
            0, 0,
            canvas.width,
            canvas.height
          )
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
          {/* Debug Overlay */}
          <div
            ref={debugOverlayRef}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              zIndex: 9999,
              pointerEvents: 'none',
              lineHeight: '1.6',
              minWidth: '200px'
            }}
          >
            Loading...
          </div>

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
