"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const appointment = {
    id: "APT001",
    date: "2024-01-20",
    time: "10:00 AM",
    duration: "1 hour",
    service: "Corporate Consultation",
    client: "John Smith",
    attorney: "Jane Doe",
    location: "Conference Room A",
    status: "pending",
    paymentStatus: "unpaid",
    amount: 250,
    paymentMethod: "",
    transactionId: "",
    clientNotes: "Looking to discuss new business structure and legal implications",
    adminNotes: "",
  }

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Appointment Detail</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.contentGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              {/* Appointment Details */}
              <section className={styles.section}>
                <h2>Appointment Details</h2>
                <div className={styles.detailsCard}>
                  <div className={styles.detailRow}>
                    <label>Date</label>
                    <p>{appointment.date}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Time</label>
                    <p>{appointment.time}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Duration</label>
                    <p>{appointment.duration}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Service Type</label>
                    <p>{appointment.service}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Client</label>
                    <p>{appointment.client}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Attorney Assigned</label>
                    <p>{appointment.attorney}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Location / Meeting Link</label>
                    <p>{appointment.location}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Status</label>
                    <p>
                      <span className={styles.statusBadge}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Client Notes */}
              <section className={styles.section}>
                <h2>Client Notes</h2>
                <div className={styles.notesBox}>
                  <p>{appointment.clientNotes}</p>
                </div>
              </section>

              {/* Admin Notes */}
              <section className={styles.section}>
                <h2>Admin Notes</h2>
                <textarea
                  className={styles.adminNotesInput}
                  placeholder="Add notes here..."
                  defaultValue={appointment.adminNotes}
                  rows={4}
                />
                <Button>Save Notes</Button>
              </section>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Actions */}
              <section className={styles.section}>
                <h2>Actions</h2>
                <div className={styles.actionButtons}>
                  {appointment.status === "pending" && (
                    <>
                      <Button className={styles.confirmButton}>Confirm Appointment</Button>
                      <Button variant="secondary" className={styles.rejectButton}>
                        Reject Appointment
                      </Button>
                    </>
                  )}
                  <Button variant="secondary">Reschedule</Button>
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="secondary">Mark as Completed</Button>
                  <Button variant="secondary">Mark as No-Show</Button>
                </div>
              </section>

              {/* Payment Info */}
              <section className={styles.section}>
                <h2>Payment Info</h2>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentRow}>
                    <label>Amount</label>
                    <p className={styles.amount}>${appointment.amount}</p>
                  </div>
                  <div className={styles.paymentRow}>
                    <label>Status</label>
                    <p>
                      <span className={styles.unpaidBadge}>{appointment.paymentStatus.toUpperCase()}</span>
                    </p>
                  </div>
                  <div className={styles.paymentRow}>
                    <label>Payment Method</label>
                    <p>{appointment.paymentMethod || "Not yet paid"}</p>
                  </div>
                  <div className={styles.paymentRow}>
                    <label>Transaction ID</label>
                    <p>{appointment.transactionId || "N/A"}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
