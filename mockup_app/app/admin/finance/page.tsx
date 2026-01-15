"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function FinanceDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const revenueCards = [
    { label: "Today", value: "$2,450", change: "+12%" },
    { label: "This Week", value: "$14,280", change: "+8%" },
    { label: "This Month", value: "$52,340", change: "+15%" },
    { label: "Outstanding", value: "$8,500", change: "-3%" },
  ]

  const transactions = [
    { date: "2026-01-15", client: "John Smith", amount: "$2,450", method: "Card", status: "Success" },
    { date: "2026-01-14", client: "Sarah Johnson", amount: "$1,200", method: "Bank Transfer", status: "Success" },
    { date: "2026-01-13", client: "Robert Brown", amount: "$3,100", method: "Jazz Cash", status: "Pending" },
  ]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Finance Dashboard</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.revenueGrid}>
            {revenueCards.map((card, idx) => (
              <div key={idx} className={styles.revenueCard}>
                <p className={styles.label}>{card.label}</p>
                <h3 className={styles.value}>{card.value}</h3>
                <p className={styles.change}>{card.change}</p>
              </div>
            ))}
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.transactionsSection}>
              <h2>Recent Transactions</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, idx) => (
                      <tr key={idx}>
                        <td>{t.date}</td>
                        <td>{t.client}</td>
                        <td className={styles.amount}>{t.amount}</td>
                        <td>{t.method}</td>
                        <td>
                          <span className={`${styles.status} ${styles[t.status.toLowerCase()]}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.quickLinksSection}>
              <h2>Quick Links</h2>
              <div className={styles.quickLinks}>
                <Link href="/admin/finance/invoices/new" className={styles.quickLink}>
                  + Create Invoice
                </Link>
                <Link href="/admin/finance/invoices" className={styles.quickLink}>
                  View All Invoices
                </Link>
                <Link href="/admin/finance/payments" className={styles.quickLink}>
                  View All Payments
                </Link>
                <Link href="/admin/finance/reports" className={styles.quickLink}>
                  Generate Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
