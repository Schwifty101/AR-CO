"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const statCards = [
    { label: "New Inquiries (Today)", value: "12", icon: "📬" },
    { label: "Upcoming Appointments (7 days)", value: "28", icon: "📅" },
    { label: "Active Cases", value: "45", icon: "📋" },
    { label: "Revenue (Today)", value: "$2,450", icon: "💰" },
    { label: "Pending Documents", value: "8", icon: "📄" },
    { label: "Outstanding Payments", value: "15", icon: "⚠️" },
    { label: "Total Clients", value: "156", icon: "👥" },
  ]

  const quickActions = [
    { label: "Create Client", icon: "👤", href: "/admin/clients/new" },
    { label: "Add Appointment", icon: "📅", href: "/admin/appointments/new" },
    { label: "Generate Invoice", icon: "💳", href: "/admin/finance/invoice" },
    { label: "View Schedule", icon: "🗓️", href: "/admin/appointments" },
    { label: "Upload Document", icon: "📤", href: "/admin/documents" },
    { label: "Send Payment Link", icon: "💸", href: "/admin/finance" },
    { label: "Mark Case Complete", icon: "✓", href: "/admin/cases" },
    { label: "View Reports", icon: "📊", href: "/admin/analytics" },
  ]

  const activityFeed = [
    { action: "New inquiry received", time: "2 minutes ago", icon: "📬" },
    { action: "Appointment confirmed", time: "15 minutes ago", icon: "✓" },
    { action: "Payment received from Client #123", time: "1 hour ago", icon: "💰" },
    { action: "Document uploaded to Case #456", time: "2 hours ago", icon: "📄" },
    { action: "New client registered", time: "3 hours ago", icon: "👤" },
    { action: "Appointment reminder sent", time: "4 hours ago", icon: "🔔" },
    { action: "Invoice generated for Client #789", time: "5 hours ago", icon: "💳" },
    { action: "Case status updated", time: "6 hours ago", icon: "📋" },
    { action: "Message received from client", time: "7 hours ago", icon: "💬" },
    { action: "Weekly report generated", time: "1 day ago", icon: "📊" },
  ]

  const todayAppointments = [
    { client: "John Smith", service: "Corporate Law", time: "10:00 AM", attorney: "Jane Doe" },
    { client: "Sarah Johnson", service: "Tax Consultation", time: "11:30 AM", attorney: "Mike Wilson" },
    { client: "Robert Brown", service: "Immigration Review", time: "2:00 PM", attorney: "Jane Doe" },
  ]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Admin Dashboard</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Stat Cards */}
          <section className={styles.statsGrid}>
            {statCards.map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </section>

          {/* Quick Actions */}
          <section className={styles.quickActionsSection}>
            <h2>Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href} className={styles.quickActionButton}>
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionLabel}>{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Main Content Grid */}
          <div className={styles.contentGrid}>
            {/* Activity Feed */}
            <section className={styles.activityFeed}>
              <h2>Activity Feed</h2>
              <div className={styles.feedList}>
                {activityFeed.map((item, idx) => (
                  <div key={idx} className={styles.feedItem}>
                    <span className={styles.feedIcon}>{item.icon}</span>
                    <div className={styles.feedContent}>
                      <p className={styles.feedAction}>{item.action}</p>
                      <p className={styles.feedTime}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Today's Appointments */}
            <section className={styles.appointmentsWidget}>
              <h2>Today's Appointments</h2>
              <div className={styles.appointmentsList}>
                {todayAppointments.map((apt, idx) => (
                  <div key={idx} className={styles.appointmentItem}>
                    <div className={styles.appointmentTime}>{apt.time}</div>
                    <div className={styles.appointmentDetails}>
                      <p className={styles.appointmentClient}>{apt.client}</p>
                      <p className={styles.appointmentService}>{apt.service}</p>
                      <p className={styles.appointmentAttorney}>{apt.attorney}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
