"use client"

import { useState } from "react"
import PortalSidebar from "@/components/portal/PortalSidebar"
import Button from "@/components/Button"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

type SettingsTab = "personal" | "security" | "notifications" | "privacy"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal")
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const activeSessions = [
    { id: 1, device: "Chrome on MacBook Pro", lastLogin: "2026-01-15 10:30 AM", ip: "192.168.1.1" },
    { id: 2, device: "Safari on iPhone", lastLogin: "2026-01-14 2:15 PM", ip: "192.168.1.5" },
  ]

  const loginHistory = [
    { id: 1, date: "2026-01-15", time: "10:30 AM", ip: "192.168.1.1", device: "Chrome on MacBook Pro" },
    { id: 2, date: "2026-01-14", time: "2:15 PM", ip: "192.168.1.5", device: "Safari on iPhone" },
    { id: 3, date: "2026-01-13", time: "9:45 AM", ip: "192.168.1.1", device: "Chrome on MacBook Pro" },
  ]

  return (
    <div className={styles.container}>
      <PortalSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Account Settings</h1>
        </div>

        <div className={styles.content}>
          <Breadcrumb items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Settings" }]} />

          <div className={styles.tabs}>
            {(["personal", "security", "notifications", "privacy"] as SettingsTab[]).map((tab) => (
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
            {activeTab === "personal" && (
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input type="text" defaultValue="John Doe" />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input type="email" defaultValue="john@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input type="tel" defaultValue="+92-300-1234567" />
                </div>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input type="text" defaultValue="ABC Corporation" />
                </div>
                <div className={styles.formGroup}>
                  <label>Address</label>
                  <textarea defaultValue="123 Business Street, Karachi, Pakistan" />
                </div>
                <Button>Save Changes</Button>
              </form>
            )}

            {activeTab === "security" && (
              <div>
                <section className={styles.section}>
                  <h3>Change Password</h3>
                  <form className={styles.form}>
                    <div className={styles.formGroup}>
                      <label>Current Password</label>
                      <input type="password" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>New Password</label>
                      <input type="password" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Confirm Password</label>
                      <input type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </form>
                </section>

                <section className={styles.section}>
                  <h3>Two-Factor Authentication</h3>
                  <div className={styles.twoFAContainer}>
                    <div className={styles.toggleGroup}>
                      <label htmlFor="twofa">Enable 2FA</label>
                      <input
                        type="checkbox"
                        id="twofa"
                        checked={twoFAEnabled}
                        onChange={() => setTwoFAEnabled(!twoFAEnabled)}
                      />
                    </div>
                    {twoFAEnabled && <p className={styles.qrCode}>QR Code will appear here for scanning</p>}
                  </div>
                </section>

                <section className={styles.section}>
                  <h3>Active Sessions</h3>
                  <div className={styles.sessionsList}>
                    {activeSessions.map((session) => (
                      <div key={session.id} className={styles.sessionItem}>
                        <div>
                          <p className={styles.sessionDevice}>{session.device}</p>
                          <p className={styles.sessionMeta}>Last login: {session.lastLogin}</p>
                          <p className={styles.sessionMeta}>IP: {session.ip}</p>
                        </div>
                        <Button variant="secondary">End Session</Button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.section}>
                  <h3>Login History</h3>
                  <div className={styles.historyTable}>
                    {loginHistory.map((entry) => (
                      <div key={entry.id} className={styles.historyRow}>
                        <div className={styles.historyInfo}>
                          <p className={styles.historyDate}>
                            {entry.date} at {entry.time}
                          </p>
                          <p className={styles.historyDevice}>{entry.device}</p>
                          <p className={styles.historyIP}>IP: {entry.ip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <form className={styles.form}>
                <h3>Email Notifications</h3>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="email1" defaultChecked />
                  <label htmlFor="email1">Case updates</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="email2" defaultChecked />
                  <label htmlFor="email2">Appointment reminders</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="email3" defaultChecked />
                  <label htmlFor="email3">Payment reminders</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="email4" />
                  <label htmlFor="email4">Newsletter</label>
                </div>

                <h3 style={{ marginTop: "2rem" }}>SMS Notifications</h3>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="sms1" defaultChecked />
                  <label htmlFor="sms1">Appointment reminders</label>
                </div>
                <div className={styles.checkboxGroup}>
                  <input type="checkbox" id="sms2" defaultChecked />
                  <label htmlFor="sms2">Urgent updates</label>
                </div>

                <Button style={{ marginTop: "2rem" }}>Save Preferences</Button>
              </form>
            )}

            {activeTab === "privacy" && (
              <div className={styles.privacySection}>
                <div className={styles.privacyItem}>
                  <div>
                    <h3>Download My Data</h3>
                    <p>Export all your account data as JSON</p>
                  </div>
                  <Button variant="secondary">Download</Button>
                </div>

                <div className={styles.privacyItem}>
                  <div>
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <Button variant="secondary" style={{ backgroundColor: "#c92a2a", color: "white" }}>
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
