"use client"

import { useState } from "react"
import Link from "next/link"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import StatCard from "@/components/portal/StatCard"
import ActivityItem from "@/components/portal/ActivityItem"
import styles from "./page.module.css"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const recentActivities = [
    { id: 1, action: "Case CS-2024-001 updated", timestamp: "2 hours ago" },
    { id: 2, action: "Document uploaded: Contract Review", timestamp: "5 hours ago" },
    { id: 3, action: "Appointment scheduled with Mr. Shoaib", timestamp: "1 day ago" },
    { id: 4, action: "Payment received for consultation", timestamp: "2 days ago" },
    { id: 5, action: "New service request submitted", timestamp: "3 days ago" },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.leftSection}>
            <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h1>Dashboard</h1>
          </div>

          <div className={styles.rightSection}>
            <button className={styles.profileDropdown}>Profile ▼</button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Welcome Message */}
          <section className={styles.welcomeSection}>
            <h2>Welcome back, John Doe</h2>
            <p>Manage your cases, appointments, and documents all in one place</p>
          </section>

          {/* Stats Cards */}
          <section className={styles.statsSection}>
            <StatCard title="Active Cases" value="3" />
            <StatCard title="Upcoming Appointments" value="1" />
            <StatCard title="Unread Documents" value="5" />
            <StatCard title="Outstanding Payments" value="PKR 15,000" />
          </section>

          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h3>Quick Actions</h3>
            <div className={styles.actionGrid}>
              <Link href="/portal/appointments/book" className={styles.actionButton}>
                <Button variant="secondary">📅 Book Consultation</Button>
              </Link>
              <Link href="/portal/services/request" className={styles.actionButton}>
                <Button variant="secondary">📝 Request Service</Button>
              </Link>
              <Link href="/portal/documents/upload" className={styles.actionButton}>
                <Button variant="secondary">📤 Upload Documents</Button>
              </Link>
              <Link href="/portal/support" className={styles.actionButton}>
                <Button variant="secondary">💬 Contact Support</Button>
              </Link>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.activitySection}>
            <h3>Recent Activity</h3>
            <div className={styles.activityList}>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} action={activity.action} timestamp={activity.timestamp} />
              ))}
            </div>
          </section>

          {/* Next Appointment */}
          <section className={styles.appointmentSection}>
            <h3>Next Appointment</h3>
            <div className={styles.appointmentCard}>
              <div className={styles.appointmentInfo}>
                <p className={styles.appointmentDate}>Friday, January 17, 2026</p>
                <p className={styles.appointmentTime}>10:00 AM - 11:00 AM</p>
                <p className={styles.appointmentAttorney}>with Mr. Shoaib Ahmed</p>
              </div>
              <Button variant="secondary">View Details</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
