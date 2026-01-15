"use client"

import type React from "react"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [responseMessage, setResponseMessage] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("assigned")
  const [selectedAttorney, setSelectedAttorney] = useState("jane-doe")

  const inquiry = {
    id: "INQ001",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 555-0123",
    service: "Corporate Law",
    message:
      "I need assistance with setting up a new business entity. Looking for guidance on the best structure for tax purposes.",
    source: "Website",
    date: "2024-01-15",
    status: "assigned",
  }

  const messages = [
    {
      author: "John Smith",
      text: "I need assistance with setting up a new business entity.",
      timestamp: "2024-01-15 10:30 AM",
      isClient: true,
    },
    {
      author: "Jane Doe",
      text: "Thank you for reaching out. I can definitely help with that. Let me gather some information first.",
      timestamp: "2024-01-15 10:45 AM",
      isClient: false,
    },
    {
      author: "John Smith",
      text: "Great! I'm flexible on timing and can provide any documentation you need.",
      timestamp: "2024-01-15 11:00 AM",
      isClient: true,
    },
  ]

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Response sent:", responseMessage)
    setResponseMessage("")
  }

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Inquiry Detail</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.contentGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              {/* Inquiry Details */}
              <section className={styles.section}>
                <h2>Inquiry Details</h2>
                <div className={styles.detailsCard}>
                  <div className={styles.detailRow}>
                    <label>Name</label>
                    <p>{inquiry.name}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Email</label>
                    <p>{inquiry.email}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Phone</label>
                    <p>{inquiry.phone}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Service Interest</label>
                    <p>{inquiry.service}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Source</label>
                    <p>{inquiry.source}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Date Received</label>
                    <p>{inquiry.date}</p>
                  </div>
                  <div className={styles.detailRow}>
                    <label>Message</label>
                    <p>{inquiry.message}</p>
                  </div>
                </div>
              </section>

              {/* Communication Thread */}
              <section className={styles.section}>
                <h2>Communication</h2>
                <div className={styles.messageThread}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`${styles.message} ${msg.isClient ? styles.clientMessage : styles.staffMessage}`}
                    >
                      <p className={styles.messageAuthor}>{msg.author}</p>
                      <p className={styles.messageText}>{msg.text}</p>
                      <p className={styles.messageTime}>{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Response Form */}
              <section className={styles.section}>
                <h2>Send Response</h2>
                <form onSubmit={handleSendResponse} className={styles.responseForm}>
                  <textarea
                    placeholder="Type your response here..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={4}
                  />
                  <Button type="submit">Send Response</Button>
                </form>
              </section>
            </div>

            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Status Selector */}
              <section className={styles.section}>
                <h2>Status</h2>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </section>

              {/* Assign To */}
              <section className={styles.section}>
                <h2>Assign To</h2>
                <select
                  value={selectedAttorney}
                  onChange={(e) => setSelectedAttorney(e.target.value)}
                  className={styles.attorneySelect}
                >
                  <option value="unassigned">Unassigned</option>
                  <option value="jane-doe">Jane Doe</option>
                  <option value="mike-wilson">Mike Wilson</option>
                  <option value="sarah-lee">Sarah Lee</option>
                </select>
              </section>

              {/* Actions */}
              <section className={styles.section}>
                <h2>Actions</h2>
                <div className={styles.actionButtons}>
                  <Button variant="secondary" className={styles.actionButton}>
                    Convert to Client
                  </Button>
                  <Button variant="secondary" className={styles.actionButton}>
                    Convert to Case
                  </Button>
                  <Button variant="secondary" className={styles.actionButton}>
                    Send Payment Link
                  </Button>
                  <Button variant="secondary" className={styles.actionButton}>
                    Schedule Appointment
                  </Button>
                </div>
              </section>

              {/* Activity Timeline */}
              <section className={styles.section}>
                <h2>Activity Timeline</h2>
                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <p className={styles.timelineLabel}>Created</p>
                    <p className={styles.timelineDate}>2024-01-15 10:00 AM</p>
                  </div>
                  <div className={styles.timelineItem}>
                    <p className={styles.timelineLabel}>Assigned to Jane Doe</p>
                    <p className={styles.timelineDate}>2024-01-15 10:15 AM</p>
                  </div>
                  <div className={styles.timelineItem}>
                    <p className={styles.timelineLabel}>Response sent</p>
                    <p className={styles.timelineDate}>2024-01-15 10:45 AM</p>
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
