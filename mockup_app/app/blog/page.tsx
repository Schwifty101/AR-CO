import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Breadcrumb from "@/components/Breadcrumb"
import styles from "./page.module.css"
import Link from "next/link"

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Understanding Corporate Law Basics",
      slug: "corporate-law-basics",
      category: "Corporate",
      date: "2024-01-15",
      excerpt: "Learn the fundamentals of corporate law and how it affects your business.",
      image: "📄",
    },
    {
      id: 2,
      title: "Tax Planning Strategies for 2024",
      slug: "tax-planning-2024",
      category: "Tax",
      date: "2024-01-10",
      excerpt: "Effective tax planning strategies to optimize your financial position.",
      image: "💰",
    },
    {
      id: 3,
      title: "Immigration Law Updates",
      slug: "immigration-updates",
      category: "Immigration",
      date: "2024-01-05",
      excerpt: "Recent updates and changes in immigration regulations.",
      image: "🌍",
    },
  ]

  return (
    <>
      <Header />
      <main className={`${styles.main} page-transition`}>
        <div className={styles.container}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

          <h1>Our Blog</h1>

          <div className={styles.controls}>
            <input type="text" placeholder="Search articles..." className={styles.search} />
            <select className={styles.filter}>
              <option>All Categories</option>
              <option>Corporate</option>
              <option>Tax</option>
              <option>Immigration</option>
            </select>
          </div>

          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postImage}>{post.image}</div>
                <div className={styles.postMeta}>
                  <span className={styles.category}>{post.category}</span>
                  <span className={styles.date}>{post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                  Read More
                </Link>
              </article>
            ))}
          </div>

          <div className={styles.pagination}>
            <button>« Previous</button>
            <button className={styles.active}>1</button>
            <button>2</button>
            <button>3</button>
            <button>Next »</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
