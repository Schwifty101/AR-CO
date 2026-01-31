"use client"

import Link from "next/link"
import Image from "next/image"
import styles from "./LogoSection.module.css"

/**
 * LogoSection Component
 *
 * Simple logo component displaying the AR&CO logo image.
 */
export default function LogoSection() {
  return (
    <Link
      href="/"
      className={styles.logoContainer}
      aria-label="AR&CO Law Firm - Return to homepage"
    >
      <Image
        src="/assets/logos/main-logo.png"
        alt="AR&CO Law Associates"
        width={120}
        height={100}
        className={styles.logoImage}
        priority
      />
    </Link>
  )
}
