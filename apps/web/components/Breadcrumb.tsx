import Link from "next/link"
import styles from "./Breadcrumb.module.css"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? <Link href={item.href} className="text-hover">{item.label}</Link> : <span>{item.label}</span>}
            {index < items.length - 1 && <span className={styles.separator}>/</span>}
          </li>
        ))}
      </ul>
    </nav>
  )
}
