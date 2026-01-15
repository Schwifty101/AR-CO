"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function CasesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  const cases = [
    {
      id: 1,
      refNumber: "CS-2024-001",
      serviceType: "Corporate Law",
      status: "In Progress",
      progress: 65,
      attorney: "👨‍⚖️ Mr. Shoaib",
      nextAction: "Awaiting client feedback",
    },
    {
      id: 2,
      refNumber: "CS-2024-002",
      serviceType: "Contract Review",
      status: "Pending Documents",
      progress: 30,
      attorney: "👩‍⚖️ Ms. Sarah",
      nextAction: "Submit additional documents",
    },
    {
      id: 3,
      refNumber: "CS-2024-003",
      serviceType: "Document Drafting",
      status: "Completed",
      progress: 100,
      attorney: "👨‍⚖️ Mr. Shoaib",
      nextAction: "None",
    },
  ]

  const filteredCases = cases.filter((c) => {
    if (activeFilter === "all") return true
    return c.status.toLowerCase().replace(" ", "-") === activeFilter
  })

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>My Cases</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "My Cases" }]} />

          {/* Filters */}
          <div className={styles.filters}>
            <button
              className={`${styles.filterBtn} ${activeFilter === "all" ? styles.active : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${activeFilter === "in-progress" ? styles.active : ""}`}
              onClick={() => setActiveFilter("in-progress")}
            >
              In Progress
            </button>
            <button
              className={`${styles.filterBtn} ${activeFilter === "pending-documents" ? styles.active : ""}`}
              onClick={() => setActiveFilter("pending-documents")}
            >
              Pending Documents
            </button>
            <button
              className={`${styles.filterBtn} ${activeFilter === "completed" ? styles.active : ""}`}
              onClick={() => setActiveFilter("completed")}
            >
              Completed
            </button>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search cases..." />
          </div>

          {/* Cases List */}
          <div className={styles.casesList}>
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className={styles.caseCard}>
                <div className={styles.caseHeader}>
                  <div>
                    <p className={styles.refNumber}>{caseItem.refNumber}</p>
                    <p className={styles.serviceType}>{caseItem.serviceType}</p>
                  </div>
                  <div className={styles.statusBadge} data-status={caseItem.status}>
                    {caseItem.status}
                  </div>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${caseItem.progress}%` }} />
                  </div>
                  <p className={styles.progressText}>{caseItem.progress}% Complete</p>
                </div>

                <div className={styles.caseFooter}>
                  <div>
                    <p className={styles.attorney}>{caseItem.attorney}</p>
                    <p className={styles.nextAction}>Next: {caseItem.nextAction}</p>
                  </div>
                  <Button variant="secondary">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
