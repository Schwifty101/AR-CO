"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [reportType, setReportType] = useState("Revenue Report")
  const [startDate, setStartDate] = useState("2026-01-01")
  const [endDate, setEndDate] = useState("2026-01-15")

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Financial Reports</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.controlPanel}>
            <div className={styles.control}>
              <label>Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={styles.input}>
                <option>Revenue Report</option>
                <option>Outstanding Invoices</option>
                <option>Payment Method Analysis</option>
                <option>Client Payment History</option>
                <option>Refund Report</option>
                <option>GST Report</option>
              </select>
            </div>
            <div className={styles.control}>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.control}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.input}
              />
            </div>
            <button className={styles.generateButton}>Generate Report</button>
          </div>

          <div className={styles.reportContainer}>
            <div className={styles.reportHeader}>
              <h2>{reportType}</h2>
              <p>
                Period: {startDate} to {endDate}
              </p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Amount (PKR)</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Corporate Law Services</td>
                    <td>450,000</td>
                    <td>15</td>
                    <td>25.5%</td>
                  </tr>
                  <tr>
                    <td>Tax Consultation</td>
                    <td>320,000</td>
                    <td>10</td>
                    <td>18.1%</td>
                  </tr>
                  <tr>
                    <td>Immigration Services</td>
                    <td>280,000</td>
                    <td>8</td>
                    <td>15.8%</td>
                  </tr>
                  <tr>
                    <td>Mediation Services</td>
                    <td>450,000</td>
                    <td>9</td>
                    <td>25.4%</td>
                  </tr>
                  <tr>
                    <td>Other Services</td>
                    <td>170,000</td>
                    <td>5</td>
                    <td>9.6%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h4>Total Revenue</h4>
                <p className={styles.summaryValue}>1,670,000 PKR</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Total Cases</h4>
                <p className={styles.summaryValue}>47</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Average Per Case</h4>
                <p className={styles.summaryValue}>35,532 PKR</p>
              </div>
            </div>

            <div className={styles.exportButtons}>
              <button className={styles.exportButton}>Export Excel</button>
              <button className={styles.exportButton}>Export PDF</button>
              <button className={styles.exportButton}>Export CSV</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
