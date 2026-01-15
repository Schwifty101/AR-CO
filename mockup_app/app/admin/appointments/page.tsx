"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewType, setViewType] = useState("list")
  const [statusFilter, setStatusFilter] = useState("all")

  const appointments = [
    {
      id: "APT001",
      date: "2024-01-20",
      time: "10:00 AM",
      client: "John Smith",
      attorney: "Jane Doe",
      service: "Corporate Consultation",
      status: "pending",
      payment: "Unpaid",
    },
    {
      id: "APT002",
      date: "2024-01-20",
      time: "2:00 PM",
      client: "Acme Corp",
      attorney: "Mike Wilson",
      service: "Contract Review",
      status: "confirmed",
      payment: "Paid",
    },
    {
      id: "APT003",
      date: "2024-01-21",
      time: "11:00 AM",
      client: "Sarah Johnson",
      attorney: "Jane Doe",
      service: "Immigration Review",
      status: "confirmed",
      payment: "Paid",
    },
    {
      id: "APT004",
      date: "2024-01-22",
      time: "3:30 PM",
      client: "Robert Brown",
      attorney: "Sarah Lee",
      service: "Tax Planning",
      status: "pending",
      payment: "Unpaid",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ff9800"
      case "confirmed":
        return "#4caf50"
      case "completed":
        return "#2196f3"
      case "cancelled":
        return "#9e9e9e"
      default:
        return "#9e9e9e"
    }
  }

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Appointments</h1>
          <div className={styles.topBarActions}>
            <Link href="/admin/appointments/new">
              <Button>Add Manual Appointment</Button>
            </Link>
            <Button variant="secondary">Availability Settings</Button>
          </div>
        </div>

        <div className={styles.content}>
          {/* View Selector */}
          <section className={styles.viewSelector}>
            <button
              className={`${styles.viewButton} ${viewType === "list" ? styles.active : ""}`}
              onClick={() => setViewType("list")}
            >
              📋 List View
            </button>
            <button
              className={`${styles.viewButton} ${viewType === "calendar" ? styles.active : ""}`}
              onClick={() => setViewType("calendar")}
            >
              📅 Calendar View
            </button>
          </section>

          {viewType === "list" && (
            <>
              {/* Filters */}
              <section className={styles.filterSection}>
                <div className={styles.filterGroup}>
                  <label>Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-Show</option>
                  </select>
                </div>
              </section>

              {/* Appointments Table */}
              <section className={styles.tableSection}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Client</th>
                      <th>Attorney</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>{apt.date}</td>
                        <td>{apt.time}</td>
                        <td>{apt.client}</td>
                        <td>{apt.attorney}</td>
                        <td>{apt.service}</td>
                        <td>
                          <span className={styles.badge} style={{ backgroundColor: getStatusColor(apt.status) }}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </td>
                        <td>{apt.payment}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <Link href={`/admin/appointments/${apt.id}`} className={styles.viewLink}>
                              View
                            </Link>
                            {apt.status === "pending" && (
                              <>
                                <button className={styles.confirmBtn}>Confirm</button>
                                <button className={styles.cancelBtn}>Cancel</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {viewType === "calendar" && (
            <section className={styles.calendarPlaceholder}>
              <p>Calendar view placeholder - Month/Week/Day toggle would go here</p>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
