"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function InvoicesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState("All")

  const invoices = [
    {
      id: 1,
      number: "INV-001",
      client: "John Smith",
      date: "2026-01-10",
      dueDate: "2026-01-25",
      amount: "$2,450",
      status: "Paid",
    },
    {
      id: 2,
      number: "INV-002",
      client: "Sarah Johnson",
      date: "2026-01-12",
      dueDate: "2026-01-27",
      amount: "$1,200",
      status: "Unpaid",
    },
    {
      id: 3,
      number: "INV-003",
      client: "Robert Brown",
      date: "2025-12-20",
      dueDate: "2026-01-04",
      amount: "$3,100",
      status: "Overdue",
    },
  ]

  const filteredInvoices = invoices.filter((inv) => statusFilter === "All" || inv.status === statusFilter)

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Invoices</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Overdue</option>
            </select>
            <Link href="/admin/finance/invoices/new" className={styles.createButton}>
              + Create Invoice
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={inv.status === "Overdue" ? styles.overdue : ""}>
                    <td className={styles.invoiceNumber}>{inv.number}</td>
                    <td>{inv.client}</td>
                    <td>{inv.date}</td>
                    <td>{inv.dueDate}</td>
                    <td className={styles.amount}>{inv.amount}</td>
                    <td>
                      <span className={`${styles.status} ${styles[inv.status.toLowerCase()]}`}>{inv.status}</span>
                    </td>
                    <td className={styles.actions}>
                      <Link href={`/admin/finance/invoices/${inv.id}`} className={styles.viewLink}>
                        View
                      </Link>
                      <button className={styles.sendLink}>Send</button>
                      <button className={styles.downloadLink}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
