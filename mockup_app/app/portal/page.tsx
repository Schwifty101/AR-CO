"use client"

import { useState } from "react"
import Link from "next/link"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function PortalHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const quickLinks = [
    { title: "Dashboard", description: "View your overview", href: "/portal/dashboard", icon: "📊" },
    { title: "My Cases", description: "Manage your cases", href: "/portal/cases", icon: "📁" },
    { title: "Appointments", description: "Schedule and view", href: "/portal/appointments", icon: "📅" },
    { title: "Documents", description: "Upload and manage", href: "/portal/documents", icon: "📄" },
    { title: "Payments", description: "View invoices", href: "/portal/payments", icon: "💳" },
    { title: "Settings", description: "Account settings", href: "/portal/settings", icon: "⚙️" },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Client Portal</h1>
        </div>

        <div className={styles.content}>
          <section className={styles.welcomeSection}>
            <h2>Welcome to AR&CO Client Portal</h2>
            <p>Manage your legal matters, appointments, and documents in one secure place</p>
          </section>

          <section className={styles.linksSection}>
            <h3>Quick Access</h3>
            <div className={styles.linksGrid}>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className={styles.linkCard}>
                  <div className={styles.linkIcon}>{link.icon}</div>
                  <div className={styles.linkContent}>
                    <p className={styles.linkTitle}>{link.title}</p>
                    <p className={styles.linkDescription}>{link.description}</p>
                  </div>
                  <div className={styles.linkArrow}>→</div>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.infoSection}>
            <h3>Need Help?</h3>
            <p>Contact our support team for assistance</p>
            <Link href="/portal/help" className={styles.buttonWrapper}>
              <Button variant="secondary">Contact Support</Button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
