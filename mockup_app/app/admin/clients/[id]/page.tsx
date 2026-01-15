"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import Button from "@/components/Button"
import styles from "./page.module.css"

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  const client = {
    id: "CLT001",
    name: "Acme Corporation",
    email: "info@acme.com",
    phone: "+1 555-0101",
    type: "corporate",
    status: "active",
    address: "123 Business Ave, New York, NY 10001",
    company: "Acme Corporation",
  }

  const tabs = ["Profile", "Cases", "Documents", "Appointments", "Payments", "Communications", "Activity Log"]

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Clients / {client.name}</h1>
        </div>

        <div className={styles.content}>
          {/* Client Header */}
          <section className={styles.clientHeader}>
            <div className={styles.headerContent}>
              <h2>{client.name}</h2>
              <div className={styles.badges}>
                <span className={styles.typeBadge}>{client.type === "corporate" ? "Corporate" : "Individual"}</span>
                <span className={styles.statusBadge}>{client.status === "active" ? "Active" : "Inactive"}</span>
              </div>
              <div className={styles.contactInfo}>
                <p>Email: {client.email}</p>
                <p>Phone: {client.phone}</p>
              </div>
            </div>
            <Button variant="secondary">Edit Profile</Button>
          </section>

          {/* Tab Navigation */}
          <section className={styles.tabNavigation}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </section>

          {/* Tab Content */}
          <section className={styles.tabContent}>
            {activeTab === "profile" && (
              <div className={styles.profileTab}>
                <h3>Personal Information</h3>
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input type="text" value={client.name} readOnly />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" value={client.email} readOnly />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input type="tel" value={client.phone} readOnly />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Address</label>
                    <input type="text" value={client.address} readOnly />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Company</label>
                    <input type="text" value={client.company} readOnly />
                  </div>
                </div>

                <h3>Client Categorization</h3>
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Type</label>
                    <select defaultValue={client.type}>
                      <option value="individual">Individual</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select defaultValue={client.status}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <h3>Internal Notes</h3>
                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <textarea placeholder="Add private notes for admin only..." rows={4} />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}

            {activeTab === "cases" && (
              <div className={styles.tabPane}>
                <p>
                  No cases yet. <a href="/admin/cases/new">Create New Case</a>
                </p>
              </div>
            )}

            {activeTab === "documents" && (
              <div className={styles.tabPane}>
                <p>
                  No documents yet. <a href="/admin/documents">Upload Document</a>
                </p>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className={styles.tabPane}>
                <p>
                  No appointments yet. <a href="/admin/appointments/new">Add Appointment</a>
                </p>
              </div>
            )}

            {activeTab === "payments" && (
              <div className={styles.tabPane}>
                <p>No payment history yet.</p>
              </div>
            )}

            {activeTab === "communications" && (
              <div className={styles.tabPane}>
                <p>No communications yet.</p>
              </div>
            )}

            {activeTab === "activity log" && (
              <div className={styles.tabPane}>
                <p>No activity yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
