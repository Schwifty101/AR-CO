"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function InquiriesListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const inquiries = [
    {
      id: "INQ001",
      name: "John Smith",
      source: "Website",
      service: "Corporate Law",
      status: "new",
      date: "2024-01-15",
      assignedTo: "Unassigned",
    },
    {
      id: "INQ002",
      name: "Sarah Johnson",
      source: "WhatsApp",
      service: "Immigration",
      status: "assigned",
      date: "2024-01-14",
      assignedTo: "Jane Doe",
    },
    {
      id: "INQ003",
      name: "Robert Brown",
      source: "Email",
      service: "Tax Law",
      status: "converted",
      date: "2024-01-13",
      assignedTo: "Mike Wilson",
    },
    {
      id: "INQ004",
      name: "Emily Davis",
      source: "Phone",
      service: "Real Estate",
      status: "new",
      date: "2024-01-12",
      assignedTo: "Unassigned",
    },
    {
      id: "INQ005",
      name: "Michael Chen",
      source: "Website",
      service: "Litigation",
      status: "assigned",
      date: "2024-01-11",
      assignedTo: "Jane Doe",
    },
  ]

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "new":
        return "#ff9800"
      case "assigned":
        return "#2196f3"
      case "converted":
        return "#4caf50"
      case "closed":
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
          <h1>Inquiries</h1>
        </div>

        <div className={styles.content}>
          {/* Filters */}
          <section className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Source</label>
              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {/* Inquiries Table */}
          <section className={styles.tableSection}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Service Interest</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className={styles.reference}>{inquiry.id}</td>
                    <td>{inquiry.name}</td>
                    <td>{inquiry.source}</td>
                    <td>{inquiry.service}</td>
                    <td>
                      <span className={styles.badge} style={{ backgroundColor: getStatusBadgeColor(inquiry.status) }}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td>{inquiry.date}</td>
                    <td>{inquiry.assignedTo}</td>
                    <td>
                      <Link href={`/admin/inquiries/${inquiry.id}`} className={styles.viewButton}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  )
}
