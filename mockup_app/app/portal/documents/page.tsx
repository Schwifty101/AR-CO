"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function DocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedDocs, setSelectedDocs] = useState<number[]>([])

  const documents = [
    { id: 1, name: "Contract Review.pdf", caseRef: "CS-2024-001", type: "PDF", date: "2024-02-10", size: "2.4 MB" },
    { id: 2, name: "Company Profile.docx", caseRef: "CS-2024-001", type: "DOCX", date: "2024-02-05", size: "1.2 MB" },
    { id: 3, name: "Meeting Minutes.pdf", caseRef: "CS-2024-002", type: "PDF", date: "2024-02-01", size: "0.8 MB" },
    {
      id: 4,
      name: "Agreement Draft v2.docx",
      caseRef: "CS-2024-003",
      type: "DOCX",
      date: "2024-01-28",
      size: "3.1 MB",
    },
  ]

  const toggleDocumentSelect = (id: number) => {
    setSelectedDocs((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedDocs(selectedDocs.length === documents.length ? [] : documents.map((d) => d.id))
  }

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>My Documents</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Documents" }]} />

          <div className={styles.toolBar}>
            <div className={styles.filters}>
              <select className={styles.filterSelect}>
                <option>All Cases</option>
                <option>CS-2024-001</option>
                <option>CS-2024-002</option>
              </select>
              <select className={styles.filterSelect}>
                <option>All Types</option>
                <option>PDF</option>
                <option>DOCX</option>
              </select>
              <input type="date" className={styles.filterSelect} />
            </div>

            <input type="text" placeholder="Search documents..." className={styles.searchInput} />

            {selectedDocs.length > 0 && <Button variant="secondary">Download Selected ({selectedDocs.length})</Button>}
          </div>

          <div className={styles.documentTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>
                <input type="checkbox" checked={selectedDocs.length === documents.length} onChange={toggleSelectAll} />
              </div>
              <div className={styles.headerCell}>Name</div>
              <div className={styles.headerCell}>Case</div>
              <div className={styles.headerCell}>Type</div>
              <div className={styles.headerCell}>Date</div>
              <div className={styles.headerCell}>Size</div>
              <div className={styles.headerCell}>Actions</div>
            </div>

            <div className={styles.tableBody}>
              {documents.map((doc) => (
                <div key={doc.id} className={styles.tableRow}>
                  <div className={styles.cell}>
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDocumentSelect(doc.id)}
                    />
                  </div>
                  <div className={styles.cell}>{doc.name}</div>
                  <div className={styles.cell}>{doc.caseRef}</div>
                  <div className={styles.cell}>{doc.type}</div>
                  <div className={styles.cell}>{doc.date}</div>
                  <div className={styles.cell}>{doc.size}</div>
                  <div className={styles.cell}>
                    <button className={styles.actionBtn}>👁️</button>
                    <button className={styles.actionBtn}>📥</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
