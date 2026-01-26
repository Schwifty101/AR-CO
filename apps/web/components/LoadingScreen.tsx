"use client"

import { useEffect, useState } from "react"
import styles from "./LoadingScreen.module.css"

interface LoadingScreenProps {
  progress: number
  isComplete: boolean
}

export default function LoadingScreen({ progress, isComplete }: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (isComplete) {
      // Add class to body to show header
      document.body.classList.add('app-loaded')
      // Allow scroll
      document.body.style.overflow = ''
      
      // Hide loading screen after animation
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    } else {
      // Prevent scroll during loading
      document.body.style.overflow = 'hidden'
    }
  }, [isComplete])

  if (isHidden) return null

  return (
    <div className={`${styles.loadingScreen} ${isComplete ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          AR&CO
          <span className={styles.titleSub}>Law Associates</span>
        </h1>
      </div>
      
      <div className={styles.counter}>
        <span className={styles.number}>{progress}</span>
        <span className={styles.percent}>%</span>
      </div>
    </div>
  )
}
