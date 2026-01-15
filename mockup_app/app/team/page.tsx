import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"

export default function TeamPage() {
  const team = [
    {
      id: 1,
      name: "Mr. Shoaib",
      title: "Lead Attorney & Founder",
      specialization: "Corporate Law",
      image: "👨‍⚖️",
    },
    {
      id: 2,
      name: "Ms. Ayesha",
      title: "Senior Attorney",
      specialization: "Tax Law",
      image: "👩‍⚖️",
    },
    {
      id: 3,
      name: "Mr. Ahmed",
      title: "Attorney",
      specialization: "Immigration Law",
      image: "👨‍⚖️",
    },
    {
      id: 4,
      name: "Ms. Fatima",
      title: "Attorney",
      specialization: "Litigation",
      image: "👩‍⚖️",
    },
  ]

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our Team" }]} />

          <h1>Meet Our Team</h1>
          <p className={styles.subtitle}>Experienced legal professionals dedicated to your success</p>

          <div className={styles.teamGrid}>
            {team.map((member) => (
              <div key={member.id} className={styles.teamCard}>
                <div className={styles.avatar}>{member.image}</div>
                <h3>{member.name}</h3>
                <p className={styles.title}>{member.title}</p>
                <p className={styles.specialization}>{member.specialization}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
