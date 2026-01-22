import Image from "next/image"
import Link from "next/link"
import styles from "./Hero.module.css"

const logos = [
  "ary-logo.png",
  "askariBank-logo.png",
  "audi-logo.png",
  "bol-logo.png",
  "DHA-Logo.png",
  "mcb-logo.png",
  "nitb-logo.png",
  "ptcl-logo.png",
  "QAU-Logo.png",
  "TenSports-logo.png",
  "Tullow-logo.png",
  "ufone-logo.png",
  "westminister-logo.png",
]

export default function Hero() {

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Hero Content */}
        <div className={styles.content}>
          <h1 className={styles.title}>
            Expert Legal Counsel <br />for Your Business Growth and Success
          </h1>
        </div>

        {/* Trusted By Section */}
        <div className={styles.trustedBy}>
          <p className={styles.trustedLabel}>TRUSTED BY</p>

          <div className={styles.logoScrollContainer}>
            <div className={styles.logoScroll}>
              {/* First set of logos */}
              <div className={styles.logoSet}>
                {logos.map((logo, index) => (
                  <div key={`a-${index}`} className={styles.logoItem}>
                    <Image
                      src={`/client-logos/${logo}`}
                      alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                      width={120}
                      height={60}
                      className={styles.logoImage}
                      priority
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className={styles.logoSet}>
                {logos.map((logo, index) => (
                  <div key={`b-${index}`} className={styles.logoItem}>
                    <Image
                      src={`/client-logos/${logo}`}
                      alt={logo.replace("-logo.png", "").replace("-Logo.png", "")}
                      width={120}
                      height={60}
                      className={styles.logoImage}
                      priority
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
