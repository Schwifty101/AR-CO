"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login form submitted", { email, password, rememberMe })
    router.push("/portal/dashboard")
  }

  return (
    <main className={`${styles.loginContainer} page-transition`}>
      <div className={styles.loginBox}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/">AR&CO</Link>
        </div>

        {/* Heading */}
        <h1>Client Portal Login</h1>

        {/* Login Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <Button type="submit" variant="primary">
            Login
          </Button>
        </form>

        {/* Forgot Password Link */}
        <div className={styles.helpText}>
          <Link href="/portal/forgot-password" className={styles.link}>
            Forgot password?
          </Link>
        </div>

        {/* Security Badge */}
        <div className={styles.securityBadge}>🔒 Secure connection</div>

        {/* Contact Link */}
        <p className={styles.contactText}>
          Don't have an account?{" "}
          <Link href="/contact" className={styles.link}>
            Contact us
          </Link>
        </p>
      </div>
    </main>
  )
}
