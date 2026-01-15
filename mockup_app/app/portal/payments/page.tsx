"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function PaymentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const outstandingInvoices = [
    { id: 1, number: "INV-2026-001", date: "2026-01-15", dueDate: "2026-02-15", amount: "PKR 25,000" },
    { id: 2, number: "INV-2026-002", date: "2026-01-25", dueDate: "2026-02-25", amount: "PKR 15,000" },
  ]

  const paymentHistory = [
    {
      id: 1,
      date: "2026-01-20",
      invoice: "INV-2026-000",
      description: "Initial Consultation",
      amount: "PKR 5,000",
      status: "Paid",
    },
    {
      id: 2,
      date: "2026-01-25",
      invoice: "INV-2025-999",
      description: "Document Review",
      amount: "PKR 10,000",
      status: "Paid",
    },
    {
      id: 3,
      date: "2026-01-10",
      invoice: "INV-2025-998",
      description: "Case Discussion",
      amount: "PKR 8,000",
      status: "Paid",
    },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Payments & Invoices</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Payments" }]} />

          {outstandingInvoices.length > 0 && (
            <section className={styles.section}>
              <h3>Outstanding Invoices</h3>
              <div className={styles.invoiceGrid}>
                {outstandingInvoices.map((invoice) => (
                  <div key={invoice.id} className={styles.invoiceCard}>
                    <div className={styles.invoiceHeader}>
                      <p className={styles.invoiceNumber}>{invoice.number}</p>
                    </div>
                    <div className={styles.invoiceContent}>
                      <div className={styles.invoiceRow}>
                        <span>Date:</span>
                        <span>{invoice.date}</span>
                      </div>
                      <div className={styles.invoiceRow}>
                        <span>Due Date:</span>
                        <span className={styles.dueDate}>{invoice.dueDate}</span>
                      </div>
                      <div className={styles.invoiceRow}>
                        <span>Amount:</span>
                        <span className={styles.amount}>{invoice.amount}</span>
                      </div>
                    </div>
                    <div className={styles.invoiceFooter}>
                      <Button>Pay Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Payment History</h3>
              <Button variant="secondary">📥 Export History</Button>
            </div>

            <div className={styles.paymentTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Date</div>
                <div className={styles.headerCell}>Invoice</div>
                <div className={styles.headerCell}>Description</div>
                <div className={styles.headerCell}>Amount</div>
                <div className={styles.headerCell}>Status</div>
                <div className={styles.headerCell}>Receipt</div>
              </div>

              <div className={styles.tableBody}>
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className={styles.tableRow}>
                    <div className={styles.cell}>{payment.date}</div>
                    <div className={styles.cell}>{payment.invoice}</div>
                    <div className={styles.cell}>{payment.description}</div>
                    <div className={styles.cell}>{payment.amount}</div>
                    <div className={styles.cell}>
                      <div className={styles.statusBadge} data-status={payment.status}>
                        {payment.status}
                      </div>
                    </div>
                    <div className={styles.cell}>
                      <button className={styles.receiptBtn}>📄</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
