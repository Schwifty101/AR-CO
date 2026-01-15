"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function ClientsListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const clients = [
    {
      id: "CLT001",
      name: "Acme Corporation",
      email: "info@acme.com",
      phone: "+1 555-0101",
      type: "corporate",
      status: "active",
      cases: 3,
      lastActivity: "2024-01-15",
    },
    {
      id: "CLT002",
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 555-0102",
      type: "individual",
      status: "active",
      cases: 1,
      lastActivity: "2024-01-14",
    },
    {
      id: "CLT003",
      name: "Tech Innovations Inc",
      email: "legal@techinno.com",
      phone: "+1 555-0103",
      type: "corporate",
      status: "active",
      cases: 5,
      lastActivity: "2024-01-13",
    },
    {
      id: "CLT004",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 555-0104",
      type: "individual",
      status: "inactive",
      cases: 0,
      lastActivity: "2023-12-20",
    },
    {
      id: "CLT005",
      name: "Global Enterprises LLC",
      email: "legal@globalent.com",
      phone: "+1 555-0105",
      type: "corporate",
      status: "active",
      cases: 8,
      lastActivity: "2024-01-15",
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
          <h1>Client Directory</h1>
          <Link href="/admin/clients/new" className={styles.addButton}>
            <Button>Add Client</Button>
          </Link>
        </div>

        <div className={styles.content}>
          {/* Filters */}
          <section className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <label>Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="individual">Individual</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {/* Clients Table */}
          <section className={styles.tableSection}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Cases</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className={styles.name}>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.type === "corporate" ? "Corporate" : "Individual"}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{
                          backgroundColor: client.status === "active" ? "#4caf50" : "#9e9e9e",
                        }}
                      >
                        {client.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{client.cases}</td>
                    <td>{client.lastActivity}</td>
                    <td>
                      <Link href={`/admin/clients/${client.id}`} className={styles.viewButton}>
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
