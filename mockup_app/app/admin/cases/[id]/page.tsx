"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [caseStatus, setCaseStatus] = useState("Active")
  const [caseProgress, setCaseProgress] = useState(65)
  const [internalNotes, setInternalNotes] = useState("")
  const [newEvent, setNewEvent] = useState("")
  const [showEventModal, setShowEventModal] = useState(false)

  const caseData = {
    title: "Corporate Restructuring",
    reference: "CASE-001",
    client: "John Smith",
    clientEmail: "john@example.com",
    clientPhone: "123-456-7890",
    attorney: "Jane Doe",
    service: "Corporate Law",
    created: "2025-11-15",
    dueDate: "2026-02-15",
    description: "Comprehensive corporate restructuring and compliance review.",
  }

  const timeline = [
    { event: "Case Created", date: "2025-11-15", description: "Initial case setup" },
    { event: "Documents Received", date: "2025-11-20", description: "Client submitted initial documents" },
    { event: "Review Started", date: "2025-11-25", description: "Attorney began review process" },
  ]

  const documents = [
    { name: "Corporate Charter.pdf", date: "2025-11-15" },
    { name: "Bylaws.pdf", date: "2025-11-20" },
    { name: "Financial Statements.xlsx", date: "2025-11-22" },
  ]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Case Details</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.breadcrumb}>
            <Link href="/admin/cases">Cases</Link> &gt; {caseData.reference}
          </div>

          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2>{caseData.title}</h2>
              <p className={styles.reference}>{caseData.reference}</p>
              <div className={styles.statusRow}>
                <label>Status:</label>
                <select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option>Pending</option>
                  <option>Active</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className={styles.progressRow}>
                <label>Progress: {caseProgress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={caseProgress}
                  onChange={(e) => setCaseProgress(Number.parseInt(e.target.value))}
                  className={styles.progressSlider}
                />
              </div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.card}>
                <h4>Client Info</h4>
                <p>
                  <strong>{caseData.client}</strong>
                </p>
                <p>{caseData.clientEmail}</p>
                <p>{caseData.clientPhone}</p>
                <Link href={`/admin/clients`} className={styles.link}>
                  View Client Profile
                </Link>
              </div>
              <div className={styles.card}>
                <h4>Attorney</h4>
                <p>
                  <strong>{caseData.attorney}</strong>
                </p>
                <select className={styles.attorneySelect}>
                  <option>Jane Doe</option>
                  <option>Mike Wilson</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tab} ${activeTab === "timeline" ? styles.active : ""}`}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline
            </button>
            <button
              className={`${styles.tab} ${activeTab === "documents" ? styles.active : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
            <button
              className={`${styles.tab} ${activeTab === "notes" ? styles.active : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          {activeTab === "overview" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <h3>Case Information</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Description:</strong> {caseData.description}
                  </div>
                  <div>
                    <strong>Service Type:</strong> {caseData.service}
                  </div>
                  <div>
                    <strong>Created Date:</strong> {caseData.created}
                  </div>
                  <div>
                    <strong>Due Date:</strong> {caseData.dueDate}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className={styles.tabContent}>
              <button className={styles.addButton} onClick={() => setShowEventModal(true)}>
                + Add Event
              </button>
              <div className={styles.timeline}>
                {timeline.map((item, idx) => (
                  <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineDate}>{item.date}</div>
                    <div className={styles.timelineContent}>
                      <h4>{item.event}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className={styles.tabContent}>
              <button className={styles.addButton}>+ Upload Document</button>
              <div className={styles.documentList}>
                {documents.map((doc, idx) => (
                  <div key={idx} className={styles.documentItem}>
                    <span>{doc.name}</span>
                    <span className={styles.documentDate}>{doc.date}</span>
                    <a href="#" className={styles.downloadLink}>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className={styles.tabContent}>
              <div className={styles.section}>
                <h3>Internal Notes</h3>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className={styles.notesTextarea}
                  placeholder="Add internal notes here..."
                ></textarea>
                <button className={styles.saveButton}>Save Notes</button>
              </div>
              <div className={styles.section}>
                <h3>Client Communication</h3>
                <textarea className={styles.notesTextarea} placeholder="Compose message to client..."></textarea>
                <button className={styles.sendButton}>Send Message to Client</button>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.completeButton}>Mark Case Complete</button>
            <button className={styles.invoiceButton}>Generate Invoice</button>
          </div>
        </div>
      </main>

      {showEventModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Add Event</h3>
            <input type="text" placeholder="Event title" className={styles.input} />
            <textarea placeholder="Event description" rows={3} className={styles.input}></textarea>
            <input type="date" className={styles.input} />
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button className={styles.addEventButton}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
