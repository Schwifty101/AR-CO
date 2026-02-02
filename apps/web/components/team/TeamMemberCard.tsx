'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import styles from './TeamMemberCard.module.css'
import type { TeamMember } from '@/app/(public)/team/teamData'

interface TeamMemberCardProps {
  member: TeamMember
  index: number
}

/**
 * Team member card component with staggered animation
 * Displays member photo, name, role, and bio
 */
export default function TeamMemberCard({ member, index }: TeamMemberCardProps) {
  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <div className={styles.imageContainer}>
        <Image
          src={member.image}
          alt={member.name}
          width={400}
          height={400}
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 3}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{member.name}</h3>
        <p className={styles.role}>{member.role}</p>
        <p className={styles.bio}>{member.bio}</p>
      </div>
    </motion.article>
  )
}
