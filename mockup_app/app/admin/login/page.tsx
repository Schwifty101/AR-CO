"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/admin/dashboard")
  }

  return (
    <main className={`${styles.loginContainer} page-transition`}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>AR&CO</h1>
          <h2>Admin Panel</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              placeholder="admin@arco.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              Remember me
            </label>
          </div>

          <Button type="submit" className={styles.submitButton}>
            Sign In to Admin Panel
          </Button>
        </form>

        <div className={styles.footer}>
          <Link href="/admin/forgot-password">Forgot password?</Link>
          <p className={styles.security}>Secure Admin Access</p>
        </div>
      </div>
    </main>
  )
}
