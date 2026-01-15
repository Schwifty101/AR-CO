"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

type TabType = "overview" | "timeline" | "documents" | "messages" | "payments"

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const caseData = {
    id: params.id,
    title: "Corporate Merger Agreement",
    refNumber: "CS-2024-001",
    status: "In Progress",
    progress: 65,
    attorney: { name: "Mr. Shoaib Ahmed", email: "shoaib@arco.com", phone: "+92-300-1234567" },
    summary: "Negotiating merger terms between two pharmaceutical companies",
    nextSteps: "Awaiting client feedback on draft agreement",
    dates: { created: "2024-01-15", nextReview: "2024-02-20" },
  }

  const timeline = [
    { icon: "📋", date: "2024-01-15", description: "Case created and assigned to Mr. Shoaib" },
    { icon: "📤", date: "2024-01-20", description: "Initial documents uploaded" },
    { icon: "💬", date: "2024-01-25", description: "Initial consultation completed" },
    { icon: "📄", date: "2024-02-01", description: "Draft agreement prepared" },
  ]

  const documents = [
    { id: 1, name: "Merger Agreement Draft.pdf", type: "PDF", date: "2024-02-01", size: "2.4 MB" },
    { id: 2, name: "Company Profile A.docx", type: "DOCX", date: "2024-01-20", size: "1.2 MB" },
    { id: 3, name: "Company Profile B.docx", type: "DOCX", date: "2024-01-20", size: "1.1 MB" },
  ]

  const messages = [
    {
      id: 1,
      sender: "Mr. Shoaib",
      message: "We have reviewed the initial terms. Please confirm.",
      time: "2024-02-10 10:30 AM",
    },
    { id: 2, sender: "You", message: "Confirmed. Please proceed with the draft.", time: "2024-02-10 11:00 AM" },
  ]

  const payments = [
    { id: 1, date: "2024-01-20", description: "Consultation fee", amount: "PKR 5,000", status: "Paid" },
    { id: 2, date: "2024-02-01", description: "Document review", amount: "PKR 10,000", status: "Pending" },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Case Details</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/portal/dashboard" },
              { label: "My Cases", href: "/portal/cases" },
              { label: caseData.refNumber },
            ]}
          />

          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2>{caseData.title}</h2>
              <p className={styles.refNumber}>{caseData.refNumber}</p>
              <div className={styles.statusBadge} data-status={caseData.status}>
                {caseData.status}
              </div>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${caseData.progress}%` }} />
            </div>
            <p className={styles.progressText}>{caseData.progress}% Complete</p>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.mainColumn}>
              <div className={styles.tabs}>
                {(["overview", "timeline", "documents", "messages", "payments"] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className={styles.tabContent}>
                {activeTab === "overview" && (
                  <div>
                    <h3>Case Summary</h3>
                    <p>{caseData.summary}</p>
                    <h3>Next Steps</h3>
                    <p>{caseData.nextSteps}</p>
                    <h3>Important Dates</h3>
                    <p>Created: {caseData.dates.created}</p>
                    <p>Next Review: {caseData.dates.nextReview}</p>
                    <Button variant="secondary">Upload Documents</Button>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className={styles.timeline}>
                    {timeline.map((event, index) => (
                      <div key={index} className={styles.timelineEvent}>
                        <div className={styles.timelineIcon}>{event.icon}</div>
                        <div className={styles.timelineContent}>
                          <p className={styles.timelineDate}>{event.date}</p>
                          <p className={styles.timelineDescription}>{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    <div className={styles.documentHeader}>
                      <h3>Documents</h3>
                      <Button variant="secondary">Upload New Document</Button>
                    </div>
                    <div className={styles.documentList}>
                      {documents.map((doc) => (
                        <div key={doc.id} className={styles.documentItem}>
                          <div className={styles.documentName}>{doc.name}</div>
                          <div className={styles.documentMeta}>
                            <span>{doc.type}</span>
                            <span>{doc.date}</span>
                            <span>{doc.size}</span>
                          </div>
                          <Button variant="secondary">Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "messages" && (
                  <div className={styles.messagesSection}>
                    <div className={styles.messagesList}>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${msg.sender === "You" ? styles.sent : styles.received}`}
                        >
                          <p className={styles.messageSender}>{msg.sender}</p>
                          <p className={styles.messageText}>{msg.message}</p>
                          <p className={styles.messageTime}>{msg.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className={styles.messageInput}>
                      <textarea placeholder="Type your message..." />
                      <Button>Send</Button>
                    </div>
                  </div>
                )}

                {activeTab === "payments" && (
                  <div>
                    <h3>Payment History</h3>
                    <div className={styles.paymentList}>
                      {payments.map((payment) => (
                        <div key={payment.id} className={styles.paymentItem}>
                          <div className={styles.paymentInfo}>
                            <p className={styles.paymentDate}>{payment.date}</p>
                            <p className={styles.paymentDescription}>{payment.description}</p>
                          </div>
                          <div className={styles.paymentAmount}>{payment.amount}</div>
                          <div className={styles.paymentStatus} data-status={payment.status}>
                            {payment.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.attorneyCard}>
                <div className={styles.attorneyImage}>👨‍⚖️</div>
                <h3>{caseData.attorney.name}</h3>
                <p className={styles.attorneyTitle}>Lead Attorney</p>
                <div className={styles.attorneyContact}>
                  <p>Email: {caseData.attorney.email}</p>
                  <p>Phone: {caseData.attorney.phone}</p>
                </div>
                <Button variant="secondary" style={{ width: "100%" }}>
                  Contact Attorney
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
