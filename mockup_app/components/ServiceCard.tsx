import Link from "next/link"
import styles from "./ServiceCard.module.css"

interface ServiceCardProps {
  title: string
  price: string
  timeline: string
  link: string
}

export default function ServiceCard({ title, price, timeline, link }: ServiceCardProps) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <div className={styles.badges}>
        <span className={styles.badge}>{price}</span>
        <span className={styles.badge}>{timeline}</span>
      </div>
      <Link href={link} className={styles.link}>
        View Details
      </Link>
    </div>
  )
}
