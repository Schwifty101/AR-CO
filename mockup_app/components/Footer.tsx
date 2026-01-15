import Link from "next/link"
import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/team">Our Team</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3>Practice Areas</h3>
          <ul>
            <li>
              <Link href="/practice/corporate-law">Corporate Law</Link>
            </li>
            <li>
              <Link href="/practice/tax-law">Tax Law</Link>
            </li>
            <li>
              <Link href="/practice/immigration">Immigration</Link>
            </li>
            <li>
              <Link href="/practice/litigation">Litigation</Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3>Contact Info</h3>
          <p>Address: 123 Legal Street, City</p>
          <p>Phone: +92-XXX-XXXXX</p>
          <p>Email: info@arco.law</p>
        </div>

        <div className={styles.section}>
          <h3>Follow Us</h3>
          <div className={styles.social}>
            <a href="#" title="LinkedIn">
              LinkedIn
            </a>
            <a href="#" title="Twitter">
              Twitter
            </a>
            <a href="#" title="Facebook">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; 2026 AR&CO Law Firm. All rights reserved.</p>
      </div>
    </footer>
  )
}
