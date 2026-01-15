"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function CasesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [attorneyFilter, setAttorneyFilter] = useState("All")

  const cases = [
    {
      id: 1,
      ref: "CASE-001",
      client: "John Smith",
      service: "Corporate Law",
      status: "Active",
      attorney: "Jane Doe",
      progress: 65,
      dueDate: "2026-02-15",
    },
    {
      id: 2,
      ref: "CASE-002",
      client: "Sarah Johnson",
      service: "Tax Consultation",
      status: "In Progress",
      attorney: "Mike Wilson",
      progress: 40,
      dueDate: "2026-02-28",
    },
    {
      id: 3,
      ref: "CASE-003",
      client: "Robert Brown",
      service: "Immigration Review",
      status: "Pending",
      attorney: "Jane Doe",
      progress: 20,
      dueDate: "2026-03-10",
    },
    {
      id: 4,
      ref: "CASE-004",
      client: "Emily Davis",
      service: "Contract Review",
      status: "Completed",
      attorney: "Mike Wilson",
      progress: 100,
      dueDate: "2026-01-20",
    },
  ]

  const filteredCases = cases.filter(
    (c) =>
      (statusFilter === "All" || c.status === statusFilter) &&
      (attorneyFilter === "All" || c.attorney === attorneyFilter),
  )

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Cases & Services</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.filters}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All</option>
                <option>Active</option>
                <option>In Progress</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
              <select
                value={attorneyFilter}
                onChange={(e) => setAttorneyFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option>All</option>
                <option>Jane Doe</option>
                <option>Mike Wilson</option>
              </select>
            </div>
            <button className={styles.createButton} onClick={() => setShowModal(true)}>
              + Create New Case
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference #</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Attorney</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.reference}>{c.ref}</td>
                    <td>{c.client}</td>
                    <td>{c.service}</td>
                    <td>
                      <span className={`${styles.status} ${styles[c.status.toLowerCase().replace(" ", "-")]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.attorney}</td>
                    <td>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${c.progress}%` }}></div>
                        <span className={styles.progressText}>{c.progress}%</span>
                      </div>
                    </td>
                    <td>{c.dueDate}</td>
                    <td>
                      <Link href={`/admin/cases/${c.id}`} className={styles.viewButton}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create New Case</h2>
            <div className={styles.formGroup}>
              <label>Client Selection</label>
              <select className={styles.input}>
                <option>Select Client</option>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Service Type</label>
              <select className={styles.input}>
                <option>Select Service</option>
                <option>Corporate Law</option>
                <option>Tax Consultation</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Assign Attorney</label>
              <select className={styles.input}>
                <option>Select Attorney</option>
                <option>Jane Doe</option>
                <option>Mike Wilson</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Case Description</label>
              <textarea className={styles.textarea} rows={4}></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input type="date" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Initial Status</label>
              <select className={styles.input}>
                <option>Pending</option>
                <option>Active</option>
                <option>In Progress</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.submitButton}>Create Case</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
