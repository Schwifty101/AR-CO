"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./PortalSidebar.module.css"

interface PortalSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function PortalSidebar({ isOpen }: PortalSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/portal/dashboard", icon: "📊" },
    { label: "My Cases", href: "/portal/cases", icon: "📁" },
    { label: "Appointments", href: "/portal/appointments", icon: "📅" },
    { label: "Documents", href: "/portal/documents", icon: "📄" },
    { label: "Payments", href: "/portal/payments", icon: "💳" },
    { label: "Services", href: "/portal/services", icon: "🛠️" },
    { label: "Settings", href: "/portal/settings", icon: "⚙️" },
    { label: "Help", href: "/portal/help", icon: "❓" },
  ]

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <Link href="/" className={`${styles.logo} text-hover`}>
          AR&CO
        </Link>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.menuItem} ${pathname === item.href ? styles.active : ""} text-hover`}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link href="/portal/login" className={`${styles.logout} text-hover`}>
          🚪 Logout
        </Link>
      </div>
    </aside>
  )
}
