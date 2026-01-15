"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function DocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [clientFilter, setClientFilter] = useState("All")
  const [caseFilter, setCaseFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const documents = [
    {
      id: 1,
      name: "Corporate Charter.pdf",
      client: "John Smith",
      case: "CASE-001",
      type: "Legal Document",
      date: "2026-01-10",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Bylaws.pdf",
      client: "John Smith",
      case: "CASE-001",
      type: "Legal Document",
      date: "2026-01-11",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Financial Statements.xlsx",
      client: "Sarah Johnson",
      case: "CASE-002",
      type: "Financial Document",
      date: "2026-01-12",
      size: "3.1 MB",
    },
    {
      id: 4,
      name: "Tax Returns 2024.pdf",
      client: "Robert Brown",
      case: "CASE-003",
      type: "Tax Document",
      date: "2026-01-13",
      size: "1.2 MB",
    },
  ]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Document Library</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.controlBar}>
            <div className={styles.filterGroup}>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All Clients</option>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
              </select>
              <select
                value={caseFilter}
                onChange={(e) => setCaseFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All Cases</option>
                <option>CASE-001</option>
                <option>CASE-002</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                placeholder="Search documents..."
              />
            </div>
            <button className={styles.uploadButton} onClick={() => setShowUploadModal(true)}>
              + Upload Document
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Case</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className={styles.docName}>{doc.name}</td>
                    <td>{doc.client}</td>
                    <td className={styles.caseRef}>{doc.case}</td>
                    <td>{doc.type}</td>
                    <td>{doc.date}</td>
                    <td className={styles.size}>{doc.size}</td>
                    <td className={styles.actions}>
                      <button className={styles.actionButton}>👁️</button>
                      <button className={styles.actionButton}>⬇️</button>
                      <button className={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.templateSection}>
            <h2>Document Templates</h2>
            <div className={styles.templateList}>
              <div className={styles.templateCard}>
                <p className={styles.templateName}>Client Agreement Template</p>
                <p className={styles.templateMeta}>v2.1 | Updated Jan 2026</p>
                <div className={styles.templateActions}>
                  <button className={styles.templateButton}>Download</button>
                  <button className={styles.templateButton}>Replace</button>
                  <button className={styles.templateButton}>Delete</button>
                </div>
              </div>
              <div className={styles.templateCard}>
                <p className={styles.templateName}>Case Closure Letter</p>
                <p className={styles.templateMeta}>v1.3 | Updated Dec 2025</p>
                <div className={styles.templateActions}>
                  <button className={styles.templateButton}>Download</button>
                  <button className={styles.templateButton}>Replace</button>
                  <button className={styles.templateButton}>Delete</button>
                </div>
              </div>
            </div>
            <button className={styles.uploadTemplateButton}>+ Upload Template</button>
          </div>
        </div>
      </main>

      {showUploadModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Upload Document</h2>
            <div className={styles.formGroup}>
              <label>Select Client</label>
              <select className={styles.input}>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
                <option>Robert Brown</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Select Case</label>
              <select className={styles.input}>
                <option>CASE-001</option>
                <option>CASE-002</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Document Type</label>
              <select className={styles.input}>
                <option>Legal Document</option>
                <option>Financial Document</option>
                <option>Tax Document</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>
                <input type="checkbox" defaultChecked /> Client Visible
              </label>
            </div>
            <div className={styles.uploadArea}>
              <p>Drag and drop files here or click to browse</p>
              <input type="file" className={styles.fileInput} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button className={styles.submitButton}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
