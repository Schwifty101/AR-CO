"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function FacilitationDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [status, setStatus] = useState("Pending")
  const [internalNotes, setInternalNotes] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false)

  const requestData = {
    reference: "REQ-001",
    service: "Mediation",
    client: "John Smith",
    clientEmail: "john@example.com",
    requestedDate: "2026-01-10",
    amount: "50000",
    paymentStatus: "Paid",
    attorney: "Jane Doe",
  }

  const documents = [
    { name: "Agreement.pdf", uploaded: "2026-01-10", reviewed: true },
    { name: "Evidence.pdf", uploaded: "2026-01-11", reviewed: false },
    { name: "Supporting Docs.zip", uploaded: "2026-01-12", reviewed: true },
  ]

  const clientNotes = "Please prioritize this matter. We need resolution within 2 weeks if possible."

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Service Request Detail</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.mainContent}>
              <div className={styles.section}>
                <h2>Request Information</h2>
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Reference:</strong> {requestData.reference}
                  </div>
                  <div>
                    <strong>Service:</strong> {requestData.service}
                  </div>
                  <div>
                    <strong>Client:</strong> {requestData.client}
                  </div>
                  <div>
                    <strong>Requested Date:</strong> {requestData.requestedDate}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Uploaded Documents</h2>
                  <button className={styles.uploadButton}>+ Upload Document</button>
                </div>
                <div className={styles.documentList}>
                  {documents.map((doc, idx) => (
                    <div key={idx} className={styles.documentItem}>
                      <div>
                        <p className={styles.documentName}>{doc.name}</p>
                        <p className={styles.documentDate}>{doc.uploaded}</p>
                      </div>
                      <div className={styles.documentActions}>
                        <input type="checkbox" defaultChecked={doc.reviewed} />
                        <a href="#" className={styles.previewLink}>
                          Preview
                        </a>
                        <a href="#" className={styles.downloadLink}>
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Client Notes</h3>
                <div className={styles.clientNotesBox}>{clientNotes}</div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Admin Notes</h3>
                  <button className={styles.saveButton}>Save Notes</button>
                </div>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className={styles.notesTextarea}
                  placeholder="Add internal notes..."
                ></textarea>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.card}>
                <h3>Request Details</h3>
                <div className={styles.cardContent}>
                  <p>
                    <strong>Email:</strong> {requestData.clientEmail}
                  </p>
                  <p>
                    <strong>Amount:</strong> PKR {requestData.amount}
                  </p>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Status Workflow</h3>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.statusSelect}>
                  <option>Pending</option>
                  <option>Under Review</option>
                  <option>Documents Required</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className={styles.card}>
                <h3>Assign To</h3>
                <select className={styles.attorneySelect}>
                  <option>Select Attorney</option>
                  <option selected>{requestData.attorney}</option>
                  <option>Mike Wilson</option>
                </select>
                <button className={styles.assignButton}>Assign</button>
              </div>

              <div className={styles.card}>
                <h3>Payment Status</h3>
                <p className={styles.paymentBadge}>{requestData.paymentStatus}</p>
                <p className={styles.amount}>PKR {requestData.amount}</p>
              </div>

              <div className={styles.actions}>
                <button className={styles.requestDocsButton} onClick={() => setShowRequestModal(true)}>
                  Request Additional Docs
                </button>
                <button className={styles.completeButton}>Mark as Completed</button>
                <button className={styles.uploadClientButton}>Upload Document</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showRequestModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Request Additional Documents</h3>
            <textarea placeholder="Message to client..." className={styles.input} rows={4}></textarea>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowRequestModal(false)}>
                Cancel
              </button>
              <button className={styles.sendButton}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
