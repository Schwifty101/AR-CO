"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function FacilitationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("catalog")
  const [showServiceModal, setShowServiceModal] = useState(false)

  const services = [
    { id: 1, name: "Mediation", category: "Dispute Resolution", price: "50000", timeline: "5", status: "Active" },
    { id: 2, name: "Arbitration", category: "Dispute Resolution", price: "75000", timeline: "10", status: "Active" },
    { id: 3, name: "Negotiation", category: "Business Services", price: "40000", timeline: "7", status: "Inactive" },
  ]

  const requests = [
    {
      id: 1,
      ref: "REQ-001",
      client: "John Smith",
      service: "Mediation",
      documents: "3/5",
      status: "Pending",
      attorney: "-",
      date: "2026-01-10",
    },
    {
      id: 2,
      ref: "REQ-002",
      client: "Sarah Johnson",
      service: "Arbitration",
      documents: "5/5",
      status: "In Progress",
      attorney: "Jane Doe",
      date: "2026-01-12",
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
          <h1>Facilitation Services</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.tabNav}>
            <button
              className={`${styles.tabButton} ${activeTab === "catalog" ? styles.active : ""}`}
              onClick={() => setActiveTab("catalog")}
            >
              Service Catalog
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "requests" ? styles.active : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Service Requests
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "analytics" ? styles.active : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {activeTab === "catalog" && (
            <div className={styles.tabContent}>
              <div className={styles.catalogHeader}>
                <h2>Service Catalog</h2>
                <button className={styles.addServiceButton} onClick={() => setShowServiceModal(true)}>
                  + Add Service
                </button>
              </div>

              <div className={styles.servicesList}>
                {services.map((service) => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceInfo}>
                      <h3>{service.name}</h3>
                      <p className={styles.serviceCategory}>{service.category}</p>
                      <div className={styles.serviceDetails}>
                        <span>PKR {service.price}</span>
                        <span>{service.timeline} days</span>
                        <span className={`${styles.statusBadge} ${styles[service.status.toLowerCase()]}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.serviceActions}>
                      <button className={styles.editButton}>✏️</button>
                      <button className={styles.deleteButton}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "requests" && (
            <div className={styles.tabContent}>
              <div className={styles.requestsHeader}>
                <h2>Service Requests</h2>
                <div className={styles.filters}>
                  <select className={styles.filterSelect}>
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference #</th>
                      <th>Client</th>
                      <th>Service</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className={styles.reference}>{req.ref}</td>
                        <td>{req.client}</td>
                        <td>{req.service}</td>
                        <td>{req.documents}</td>
                        <td>
                          <span className={`${styles.status} ${styles[req.status.toLowerCase().replace(" ", "-")]}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>{req.attorney}</td>
                        <td>{req.date}</td>
                        <td>
                          <Link href={`/admin/facilitation/${req.id}`} className={styles.viewButton}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
              <h2>Analytics</h2>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h4>Total Requests</h4>
                  <p className={styles.analyticsValue}>24</p>
                </div>
                <div className={styles.analyticsCard}>
                  <h4>Completed</h4>
                  <p className={styles.analyticsValue}>18</p>
                </div>
                <div className={styles.analyticsCard}>
                  <h4>In Progress</h4>
                  <p className={styles.analyticsValue}>4</p>
                </div>
                <div className={styles.analyticsCard}>
                  <h4>Pending</h4>
                  <p className={styles.analyticsValue}>2</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showServiceModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add/Edit Service</h2>
            <div className={styles.formGroup}>
              <label>Service Name</label>
              <input type="text" className={styles.input} placeholder="e.g., Mediation" />
            </div>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select className={styles.input}>
                <option>Dispute Resolution</option>
                <option>Business Services</option>
                <option>Legal Services</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea className={styles.textarea} rows={3}></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Price (PKR)</label>
              <input type="number" className={styles.input} placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label>Timeline (days)</label>
              <input type="number" className={styles.input} placeholder="0" />
            </div>
            <div className={styles.formGroup}>
              <label>
                <input type="checkbox" defaultChecked /> Active
              </label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowServiceModal(false)}>
                Cancel
              </button>
              <button className={styles.submitButton}>Save Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
