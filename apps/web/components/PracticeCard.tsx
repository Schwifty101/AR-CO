import Link from "next/link"
import styles from "./PracticeCard.module.css"

interface PracticeCardProps {
  title: string
  description: string
  icon: string
  link: string
}

export default function PracticeCard({ title, description, icon, link }: PracticeCardProps) {
  return (
    <Link href={link}>
      <div className={`${styles.card} card-hover`}>
        <div className={styles.icon}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}
