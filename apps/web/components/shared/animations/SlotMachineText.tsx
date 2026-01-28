'use client'

import { motion } from 'framer-motion'
import styles from './SlotMachineText.module.css'

/**
 * SlotMachineText Component
 *
 * A text animation component that creates a slot machine/rolling effect on hover.
 * Each character rolls upward revealing a duplicate character from below.
 *
 * @example
 * ```tsx
 * <SlotMachineText>Home</SlotMachineText>
 * <SlotMachineText className="custom-class">Navigation Link</SlotMachineText>
 * ```
 */
interface SlotMachineTextProps {
  /** The text content to display and animate */
  children: string
  /** Optional additional CSS class names */
  className?: string
}

export default function SlotMachineText({ children, className }: SlotMachineTextProps) {
  return (
    <motion.span
      className={`${styles.container} ${className || ''}`}
      initial="rest"
      whileHover="hover"
    >
      {children.split('').map((char, i) => (
        <span key={i} className={styles.charWrapper}>
          {/* Original character that slides up */}
          <motion.span
            className={styles.char}
            variants={{
              rest: { y: 0 },
              hover: { y: '-100%' }
            }}
            transition={{
              duration: 0.3,
              delay: i * 0.02,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>

          {/* Duplicate character that slides in from below */}
          <motion.span
            className={styles.charDuplicate}
            variants={{
              rest: { y: '100%' },
              hover: { y: 0 }
            }}
            transition={{
              duration: 0.3,
              delay: i * 0.02,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
