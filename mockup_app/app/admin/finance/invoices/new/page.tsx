"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function CreateInvoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lineItems, setLineItems] = useState([{ description: "", quantity: 1, rate: 0 }])
  const [selectedClient, setSelectedClient] = useState("")

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const gst = subtotal * 0.18
  const total = subtotal + gst

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0 }])
  }

  const handleLineItemChange = (idx, field, value) => {
    const newItems = [...lineItems]
    newItems[idx][field] = field === "description" ? value : Number.parseFloat(value)
    setLineItems(newItems)
  }

  const handleRemoveLineItem = (idx) => {
    setLineItems(lineItems.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Create Invoice</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.invoiceForm}>
            <div className={styles.section}>
              <h2>Invoice Details</h2>
              <div className={styles.grid}>
                <div className={styles.formGroup}>
                  <label>Invoice Number</label>
                  <input type="text" disabled value="INV-004" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Invoice Date</label>
                  <input type="date" defaultValue="2026-01-15" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input type="date" className={styles.input} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Client Selection</h2>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className={styles.input}
              >
                <option>Select Client</option>
                <option>John Smith</option>
                <option>Sarah Johnson</option>
                <option>Robert Brown</option>
              </select>
            </div>

            <div className={styles.section}>
              <h2>Line Items</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                            className={styles.tableInput}
                            placeholder="Description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                            className={styles.tableInput}
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(idx, "rate", e.target.value)}
                            className={styles.tableInput}
                          />
                        </td>
                        <td className={styles.amount}>{item.quantity * item.rate}</td>
                        <td>
                          <button className={styles.removeButton} onClick={() => handleRemoveLineItem(idx)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className={styles.addButton} onClick={handleAddLineItem}>
                + Add Line Item
              </button>
            </div>

            <div className={styles.section}>
              <div className={styles.calculations}>
                <div className={styles.calcRow}>
                  <span>Subtotal:</span>
                  <span className={styles.amount}>{subtotal}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>GST (18%):</span>
                  <span className={styles.amount}>{gst.toFixed(2)}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.total}`}>
                  <span>Total:</span>
                  <span className={styles.totalAmount}>{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Payment Terms</h2>
              <select className={styles.input}>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Due on Receipt</option>
              </select>
            </div>

            <div className={styles.section}>
              <h2>Notes</h2>
              <textarea className={styles.textarea} placeholder="Optional message to client..." rows={4}></textarea>
            </div>

            <div className={styles.actions}>
              <button className={styles.draftButton}>Save as Draft</button>
              <button className={styles.sendButton}>Save & Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
