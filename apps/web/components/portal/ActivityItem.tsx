import styles from "./ActivityItem.module.css"

interface ActivityItemProps {
  action: string
  timestamp: string
}

export default function ActivityItem({ action, timestamp }: ActivityItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.content}>
        <p className={styles.action}>{action}</p>
        <p className={styles.timestamp}>{timestamp}</p>
      </div>
      <div className={styles.arrow}>→</div>
    </div>
  )
}
