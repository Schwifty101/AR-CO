import styles from "./StatCard.module.css"

interface StatCardProps {
  title: string
  value: string
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
    </div>
  )
}
