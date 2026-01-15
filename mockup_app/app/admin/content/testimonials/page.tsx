"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function TestimonialsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const testimonials = [
    {
      id: 1,
      name: "Ahmed Hassan",
      title: "CEO, Tech Solutions",
      quote: "AR&CO provided exceptional legal guidance for our corporate restructuring.",
      active: true,
      order: 1,
    },
    {
      id: 2,
      name: "Fatima Khan",
      title: "Founder, Import/Export Business",
      quote:
        "Their tax consultation service helped us optimize our business structure and reduce liabilities significantly.",
      active: true,
      order: 2,
    },
    {
      id: 3,
      name: "Muhammad Ali",
      title: "Manager, Manufacturing",
      quote: "The mediation service resolved our contract dispute efficiently and professionally.",
      active: false,
      order: 3,
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
          <h1>Testimonials</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <button className={styles.addButton} onClick={() => setShowModal(true)}>
            + Add Testimonial
          </button>

          <div className={styles.testimonialsList}>
            {testimonials.map((t) => (
              <div key={t.id} className={styles.testimonialCard}>
                <div className={styles.cardContent}>
                  <p className={styles.quote}>"{t.quote}"</p>
                  <p className={styles.name}>{t.name}</p>
                  <p className={styles.title}>{t.title}</p>
                </div>
                <div className={styles.cardActions}>
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" defaultChecked={t.active} className={styles.toggle} />
                    <span className={styles.toggleSlider}></span>
                  </label>
                  <div className={styles.actionButtons}>
                    <button className={styles.editButton}>✏️</button>
                    <button className={styles.deleteButton}>🗑️</button>
                  </div>
                </div>
                <p className={styles.order}>Order: {t.order}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Testimonial</h2>
            <div className={styles.formGroup}>
              <label>Client Name</label>
              <input type="text" className={styles.input} placeholder="e.g., Ahmed Hassan" />
            </div>
            <div className={styles.formGroup}>
              <label>Title/Company</label>
              <input type="text" className={styles.input} placeholder="e.g., CEO, Tech Solutions" />
            </div>
            <div className={styles.formGroup}>
              <label>Quote (2-4 sentences)</label>
              <textarea className={styles.textarea} rows={4} placeholder="Client testimonial text..."></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Photo Upload</label>
              <div className={styles.photoUpload}>
                <p>Drag and drop or click to upload</p>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Display Order</label>
              <input type="number" className={styles.input} placeholder="1" />
            </div>
            <div className={styles.formGroup}>
              <label>
                <input type="checkbox" defaultChecked /> Active
              </label>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
