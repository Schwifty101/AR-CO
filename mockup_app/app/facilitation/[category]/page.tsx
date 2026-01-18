import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import ServiceCard from "@/components/ServiceCard"
import styles from "./page.module.css"

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  
  const services = [
    { title: "Business Incorporation", price: "PKR 25,000", timeline: "5 days", slug: "business-incorporation" },
    { title: "Memorandum of Association", price: "PKR 15,000", timeline: "3 days", slug: "memorandum-of-association" },
    { title: "Articles of Association", price: "PKR 12,000", timeline: "2 days", slug: "articles-of-association" },
  ]

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Facilitation", href: "/facilitation" },
              { label: decodeURIComponent(category) },
            ]}
          />

          <h1>{decodeURIComponent(category).replace(/-/g, " ")}</h1>
          <p className={styles.description}>
            Professional services in this category with transparent pricing and timelines.
          </p>

          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                price={service.price}
                timeline={service.timeline}
                link={`/facilitation/${category}/${service.slug}`}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
