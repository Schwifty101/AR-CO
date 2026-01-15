"use client"

import { useState } from "react"
import Link from "next/link"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

type ViewType = "calendar" | "list"

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewType, setViewType] = useState<ViewType>("list")

  const upcomingAppointments = [
    {
      id: 1,
      date: "2026-01-20",
      time: "10:00 AM",
      service: "Initial Consultation",
      attorney: "Mr. Shoaib Ahmed",
      location: "Video Call",
    },
    {
      id: 2,
      date: "2026-02-05",
      time: "2:00 PM",
      service: "Case Discussion",
      attorney: "Ms. Sarah Khan",
      location: "Office - Room 201",
    },
  ]

  const pastAppointments = [
    {
      id: 3,
      date: "2026-01-10",
      time: "11:00 AM",
      service: "Document Review",
      attorney: "Mr. Shoaib Ahmed",
      location: "Office - Room 201",
    },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>My Appointments</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Appointments" }]} />

          <div className={styles.toolbar}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewType === "list" ? styles.active : ""}`}
                onClick={() => setViewType("list")}
              >
                📋 List
              </button>
              <button
                className={`${styles.viewBtn} ${viewType === "calendar" ? styles.active : ""}`}
                onClick={() => setViewType("calendar")}
              >
                📅 Calendar
              </button>
            </div>
            <Link href="/portal/appointments/book" className={styles.buttonWrapper}>
              <Button>Book New Appointment</Button>
            </Link>
          </div>

          {viewType === "list" && (
            <>
              <section className={styles.section}>
                <h3>Upcoming Appointments</h3>
                <div className={styles.appointmentsList}>
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className={styles.appointmentCard}>
                      <div className={styles.appointmentContent}>
                        <p className={styles.appointmentDateTime}>
                          {apt.date} at {apt.time}
                        </p>
                        <p className={styles.appointmentService}>{apt.service}</p>
                        <p className={styles.appointmentAttorney}>with {apt.attorney}</p>
                        <p className={styles.appointmentLocation}>{apt.location}</p>
                      </div>
                      <Link href={`/portal/appointments/${apt.id}`} className={styles.buttonWrapper}>
                        <Button variant="secondary">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h3>Past Appointments</h3>
                <div className={styles.appointmentsList}>
                  {pastAppointments.map((apt) => (
                    <div key={apt.id} className={`${styles.appointmentCard} ${styles.past}`}>
                      <div className={styles.appointmentContent}>
                        <p className={styles.appointmentDateTime}>
                          {apt.date} at {apt.time}
                        </p>
                        <p className={styles.appointmentService}>{apt.service}</p>
                        <p className={styles.appointmentAttorney}>with {apt.attorney}</p>
                        <p className={styles.appointmentLocation}>{apt.location}</p>
                      </div>
                      <Link href={`/portal/appointments/${apt.id}`} className={styles.buttonWrapper}>
                        <Button variant="secondary">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {viewType === "calendar" && (
            <div className={styles.calendarPlaceholder}>
              <p>Calendar view will display upcoming appointments on a monthly grid</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
