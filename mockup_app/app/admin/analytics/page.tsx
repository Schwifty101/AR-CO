"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dateRange, setDateRange] = useState("30days")

  const metricCards = [
    { label: "Total Clients", value: "156", icon: "👥", change: "+12" },
    { label: "Active Cases", value: "42", icon: "📋", change: "+5" },
    { label: "Monthly Revenue", value: "1,670,000 PKR", icon: "💰", change: "+18%" },
    { label: "Website Visitors", value: "8,420", icon: "📊", change: "+24%" },
    { label: "Conversion Rate", value: "3.2%", icon: "📈", change: "+0.5%" },
  ]

  const popularPosts = [
    { title: "Understanding Corporate Law", views: 521 },
    { title: "Tax Planning Tips for 2026", views: 387 },
    { title: "Mediation Benefits", views: 342 },
  ]

  const acquisitionData = [
    { month: "Jan", clients: 12 },
    { month: "Feb", clients: 19 },
    { month: "Mar", clients: 15 },
    { month: "Apr", clients: 28 },
    { month: "May", clients: 22 },
    { month: "Jun", clients: 35 },
  ]

  const serviceDemand = [
    { service: "Corporate Law", requests: 45 },
    { service: "Tax Consultation", requests: 32 },
    { service: "Immigration", requests: 28 },
    { service: "Mediation", requests: 38 },
  ]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Analytics</h1>
          <div className={styles.topBarRight}>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={styles.dateRangeSelect}>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            {metricCards.map((metric, idx) => (
              <div key={idx} className={styles.metricCard}>
                <div className={styles.metricIcon}>{metric.icon}</div>
                <div className={styles.metricContent}>
                  <p className={styles.metricLabel}>{metric.label}</p>
                  <h3 className={styles.metricValue}>{metric.value}</h3>
                  <p className={styles.metricChange}>{metric.change}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            {/* Client Acquisition Chart */}
            <div className={styles.chartCard}>
              <h2>Client Acquisition (Monthly)</h2>
              <div className={styles.chart}>
                <div className={styles.chartYAxis}>
                  <span>40</span>
                  <span>30</span>
                  <span>20</span>
                  <span>10</span>
                  <span>0</span>
                </div>
                <div className={styles.chartBars}>
                  {acquisitionData.map((data, idx) => (
                    <div key={idx} className={styles.barContainer}>
                      <div className={styles.bar} style={{ height: `${(data.clients / 40) * 100}%` }}></div>
                      <span className={styles.barLabel}>{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Demand Chart */}
            <div className={styles.chartCard}>
              <h2>Service Demand</h2>
              <div className={styles.barChartVertical}>
                {serviceDemand.map((service, idx) => (
                  <div key={idx} className={styles.serviceBar}>
                    <div className={styles.barTrack}>
                      <div className={styles.barProgress} style={{ width: `${(service.requests / 50) * 100}%` }}></div>
                    </div>
                    <span className={styles.serviceLabel}>{service.service}</span>
                    <span className={styles.serviceValue}>{service.requests}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Content */}
          <div className={styles.contentSection}>
            <h2>Popular Content</h2>
            <div className={styles.contentList}>
              {popularPosts.map((post, idx) => (
                <div key={idx} className={styles.contentItem}>
                  <span className={styles.contentTitle}>{post.title}</span>
                  <span className={styles.contentViews}>{post.views} views</span>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Patterns */}
          <div className={styles.appointmentSection}>
            <h2>Appointment Patterns (by day and time)</h2>
            <div className={styles.heatmap}>
              <table className={styles.heatmapTable}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>9-11 AM</td>
                    <td className={styles.heat3}>8</td>
                    <td className={styles.heat4}>12</td>
                    <td className={styles.heat2}>5</td>
                    <td className={styles.heat4}>11</td>
                    <td className={styles.heat1}>3</td>
                  </tr>
                  <tr>
                    <td>11 AM-1 PM</td>
                    <td className={styles.heat4}>14</td>
                    <td className={styles.heat4}>16</td>
                    <td className={styles.heat3}>9</td>
                    <td className={styles.heat4}>13</td>
                    <td className={styles.heat2}>6</td>
                  </tr>
                  <tr>
                    <td>2-4 PM</td>
                    <td className={styles.heat3}>7</td>
                    <td className={styles.heat3}>9</td>
                    <td className={styles.heat2}>4</td>
                    <td className={styles.heat3}>8</td>
                    <td className={styles.heat1}>2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
