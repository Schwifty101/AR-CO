"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState("All")
  const [methodFilter, setMethodFilter] = useState("All")

  const payments = [
    {
      id: 1,
      txId: "TXN-001",
      date: "2026-01-15",
      client: "John Smith",
      amount: "$2,450",
      method: "Card",
      status: "Successful",
      invoice: "INV-001",
    },
    {
      id: 2,
      txId: "TXN-002",
      date: "2026-01-14",
      client: "Sarah Johnson",
      amount: "$1,200",
      method: "Jazz Cash",
      status: "Successful",
      invoice: "INV-002",
    },
    {
      id: 3,
      txId: "TXN-003",
      date: "2026-01-13",
      client: "Robert Brown",
      amount: "$3,100",
      method: "Bank Transfer",
      status: "Pending",
      invoice: "INV-003",
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
          <h1>Payments</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option>All Status</option>
              <option>Successful</option>
              <option>Failed</option>
              <option>Pending</option>
              <option>Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option>All Methods</option>
              <option>Card</option>
              <option>Jazz Cash</option>
              <option>Easypaisa</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.txId}>{p.txId}</td>
                    <td>{p.date}</td>
                    <td>{p.client}</td>
                    <td className={styles.amount}>{p.amount}</td>
                    <td>{p.method}</td>
                    <td>
                      <span className={`${styles.status} ${styles[p.status.toLowerCase()]}`}>{p.status}</span>
                    </td>
                    <td>{p.invoice}</td>
                    <td className={styles.actions}>
                      <button className={styles.viewButton}>View</button>
                      <button className={styles.refundButton}>Refund</button>
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
