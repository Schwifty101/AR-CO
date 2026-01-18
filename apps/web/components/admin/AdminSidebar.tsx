"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./AdminSidebar.module.css"

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "CRM (Clients)", href: "/admin/clients", icon: "👥" },
    { label: "Inquiries", href: "/admin/inquiries", icon: "📬" },
    { label: "Appointments", href: "/admin/appointments", icon: "📅" },
    { label: "Cases", href: "/admin/cases", icon: "📋" },
    { label: "Facilitation", href: "/admin/facilitation", icon: "🤝" },
    { label: "Finance", href: "/admin/finance", icon: "💰" },
    { label: "Documents", href: "/admin/documents", icon: "📄" },
    { label: "Content", href: "/admin/content", icon: "✍️" },
    { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ]

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <Link href="/" className={`${styles.logo} text-hover`}>
          AR&CO
        </Link>
        <p className={styles.subtitle}>Admin Panel</p>
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
        <Link href="/admin/login" className={`${styles.logout} text-hover`}>
          🚪 Logout
        </Link>
      </div>
    </aside>
  )
}
