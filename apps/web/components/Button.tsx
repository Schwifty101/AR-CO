"use client"

import type React from "react"

import styles from "./Button.module.css"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary"
  type?: "button" | "submit" | "reset"
  className?: string
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: ButtonProps) {
  const buttonClass = variant === "primary" ? styles.primary : styles.secondary

  return (
    <button type={type} onClick={onClick} className={`${buttonClass} button-hover ${className}`}>
      {children}
    </button>
  )
}
