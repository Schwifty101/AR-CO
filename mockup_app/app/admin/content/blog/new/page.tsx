"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import styles from "./page.module.css"

export default function BlogEditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [slug, setSlug] = useState("")
  const [status, setStatus] = useState("Draft")

  return (
    <div className={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`${styles.main} page-transition`}>
        <div className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>Blog Editor</h1>
          <div className={styles.topBarRight}>
            <button className={styles.notificationBell}>🔔</button>
            <button className={styles.profileDropdown}>👤 Admin</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.editorLayout}>
            <div className={styles.editorMain}>
              <div className={styles.section}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post Title"
                  className={styles.titleInput}
                />
              </div>

              <div className={styles.section}>
                <label>Featured Image</label>
                <div className={styles.imageUpload}>
                  <p>Click to upload featured image</p>
                </div>
              </div>

              <div className={styles.section}>
                <label>Content</label>
                <div className={styles.editor}>
                  <div className={styles.toolbar}>
                    <button className={styles.toolButton} title="Bold">
                      B
                    </button>
                    <button className={styles.toolButton} title="Italic">
                      I
                    </button>
                    <button className={styles.toolButton} title="Heading">
                      H
                    </button>
                    <button className={styles.toolButton} title="List">
                      ≡
                    </button>
                    <button className={styles.toolButton} title="Link">
                      🔗
                    </button>
                    <button className={styles.toolButton} title="Image">
                      🖼️
                    </button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your post content here..."
                    className={styles.textarea}
                  ></textarea>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.previewButton}>Preview</button>
                <button className={styles.draftButton}>Save Draft</button>
                <button className={styles.publishButton}>Publish</button>
              </div>
            </div>

            <div className={styles.editorSidebar}>
              <div className={styles.sideCard}>
                <h3>Publish</h3>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.input}>
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Scheduled</option>
                </select>
              </div>

              <div className={styles.sideCard}>
                <h3>Categories</h3>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input type="checkbox" /> Corporate Law
                  </label>
                  <label>
                    <input type="checkbox" /> Tax
                  </label>
                  <label>
                    <input type="checkbox" /> Immigration
                  </label>
                  <label>
                    <input type="checkbox" /> Facilitation
                  </label>
                </div>
              </div>

              <div className={styles.sideCard}>
                <h3>Tags</h3>
                <input type="text" placeholder="Add tags (comma separated)" className={styles.input} />
              </div>

              <div className={styles.sideCard}>
                <h3>SEO</h3>
                <label>Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className={styles.input}
                />
                <label>Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className={styles.input}
                  rows={3}
                ></textarea>
                <label>URL Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={styles.input} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
