"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const appointment = {
    id: params.id,
    date: "2026-01-20",
    time: "10:00 AM",
    duration: "1 hour",
    service: "Initial Consultation",
    attorney: { name: "Mr. Shoaib Ahmed", photo: "👨‍⚖️" },
    location: "Video Call",
    meetingLink: "https://meet.arco.com/apt123",
    status: "Upcoming",
  }

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Appointment Details</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/portal/dashboard" },
              { label: "Appointments", href: "/portal/appointments" },
              { label: appointment.date },
            ]}
          />

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{appointment.service}</h2>
              <div className={styles.statusBadge}>{appointment.status}</div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.contentRow}>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Date</p>
                  <p className={styles.fieldValue}>{appointment.date}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Time</p>
                  <p className={styles.fieldValue}>{appointment.time}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Duration</p>
                  <p className={styles.fieldValue}>{appointment.duration}</p>
                </div>
              </div>

              <div className={styles.contentRow}>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Location</p>
                  <p className={styles.fieldValue}>{appointment.location}</p>
                </div>
                {appointment.location === "Video Call" && (
                  <div className={styles.field}>
                    <p className={styles.fieldLabel}>Meeting Link</p>
                    <p className={styles.fieldValue}>
                      <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                        Join Meeting
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.attorneySection}>
                <p className={styles.fieldLabel}>Attorney</p>
                <div className={styles.attorneyInfo}>
                  <div className={styles.attorneyPhoto}>{appointment.attorney.photo}</div>
                  <p className={styles.attorneyName}>{appointment.attorney.name}</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="secondary">📥 Add to Calendar</Button>
              {appointment.status === "Upcoming" && <Button variant="secondary">Reschedule</Button>}
              {appointment.status === "Upcoming" && <Button variant="secondary">Cancel Appointment</Button>}
              {appointment.status === "Completed" && <Button variant="secondary">Book Follow-up</Button>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
