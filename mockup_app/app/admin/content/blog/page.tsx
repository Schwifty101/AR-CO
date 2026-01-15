"use client"

import { useState } from "react"
import Link from "next/link"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function BlogManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusFilter, setStatusFilter] = useState("All")

  const posts = [
    {
      id: 1,
      title: "Understanding Corporate Law",
      author: "Jane Doe",
      status: "Published",
      date: "2026-01-10",
      views: 342,
    },
    {
      id: 2,
      title: "Tax Planning Tips for 2026",
      author: "Mike Wilson",
      status: "Draft",
      date: "2026-01-12",
      views: 0,
    },
    {
      id: 3,
      title: "Mediation Benefits Explained",
      author: "Jane Doe",
      status: "Published",
      date: "2026-01-08",
      views: 521,
    },
  ]

  const filteredPosts = posts.filter((p) => statusFilter === "All" || p.status === statusFilter)

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Blog Posts</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option>All</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
            <Link href="/admin/content/blog/new" className={styles.newPostButton}>
              + New Post
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td className={styles.title}>{post.title}</td>
                    <td>{post.author}</td>
                    <td>
                      <span className={`${styles.status} ${styles[post.status.toLowerCase()]}`}>{post.status}</span>
                    </td>
                    <td>{post.date}</td>
                    <td>{post.views}</td>
                    <td className={styles.actions}>
                      <Link href={`/admin/content/blog/${post.id}/edit`} className={styles.editButton}>
                        Edit
                      </Link>
                      <button className={styles.deleteButton}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
