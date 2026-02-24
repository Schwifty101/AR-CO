"use client"

import { useEffect, useState } from "react"
import styles from "./HeroV2.module.css"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BgItem {
  text: string
  top: string
  left: string
  fontSize: string
  opacity: number
  /** Parallax depth — higher = more vertical drift on scroll */
  depth: number
}

// ─── Legal maxims — italic serif, scattered across hero background ────────────

const LEGAL_QUOTES: BgItem[] = [
  // Top zone
  { text: "Justice delayed is justice denied",   top: "4%",  left: "2%",  fontSize: "1.10rem", opacity: 0.12, depth: 0.60 },
  { text: "No man is above the law",             top: "8%",  left: "58%", fontSize: "0.95rem", opacity: 0.10, depth: 0.30 },
  { text: "Innocent until proven guilty",        top: "14%", left: "24%", fontSize: "1.05rem", opacity: 0.11, depth: 0.50 },
  { text: "Equal justice under law",             top: "20%", left: "70%", fontSize: "0.90rem", opacity: 0.09, depth: 0.40 },
  { text: "The rule of law",                     top: "6%",  left: "37%", fontSize: "1.30rem", opacity: 0.10, depth: 0.25 },
  { text: "Justice is blind",                    top: "23%", left: "5%",  fontSize: "1.20rem", opacity: 0.12, depth: 0.65 },
  { text: "Truth is the foundation of justice",  top: "17%", left: "54%", fontSize: "0.80rem", opacity: 0.08, depth: 0.45 },
  { text: "Law is order in society",             top: "11%", left: "82%", fontSize: "1.00rem", opacity: 0.09, depth: 0.35 },
  { text: "Fiat justitia ruat caelum",           top: "3%",  left: "52%", fontSize: "0.88rem", opacity: 0.09, depth: 0.50 },
  { text: "Ignorantia juris non excusat",        top: "10%", left: "16%", fontSize: "0.92rem", opacity: 0.08, depth: 0.40 },
  { text: "Audi alteram partem",                 top: "19%", left: "44%", fontSize: "1.15rem", opacity: 0.10, depth: 0.35 },
  { text: "Nemo judex in sua causa",             top: "25%", left: "62%", fontSize: "0.85rem", opacity: 0.08, depth: 0.55 },
  { text: "Ubi jus ibi remedium",                top: "7%",  left: "73%", fontSize: "0.90rem", opacity: 0.09, depth: 0.30 },
  { text: "The law protects those who are just", top: "22%", left: "30%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Actus non facit reum",                top: "15%", left: "88%", fontSize: "0.88rem", opacity: 0.08, depth: 0.45 },
  { text: "Let the facts speak for themselves",  top: "26%", left: "14%", fontSize: "0.80rem", opacity: 0.08, depth: 0.50 },
  // Left band
  { text: "Rights must be protected",            top: "30%", left: "2%",  fontSize: "1.00rem", opacity: 0.10, depth: 0.55 },
  { text: "Due process of law",                  top: "46%", left: "4%",  fontSize: "1.10rem", opacity: 0.11, depth: 0.40 },
  { text: "The law must be fair",                top: "38%", left: "12%", fontSize: "0.85rem", opacity: 0.09, depth: 0.70 },
  { text: "Justice must be seen to be done",     top: "34%", left: "20%", fontSize: "0.82rem", opacity: 0.08, depth: 0.50 },
  { text: "Presumption of innocence",            top: "51%", left: "8%",  fontSize: "0.92rem", opacity: 0.09, depth: 0.45 },
  { text: "No punishment without law",           top: "43%", left: "1%",  fontSize: "0.88rem", opacity: 0.08, depth: 0.60 },
  { text: "The burden of proof",                 top: "28%", left: "30%", fontSize: "1.00rem", opacity: 0.09, depth: 0.35 },
  // Right band
  { text: "Liberty under law",                   top: "33%", left: "65%", fontSize: "1.05rem", opacity: 0.10, depth: 0.30 },
  { text: "All are equal before the law",        top: "49%", left: "72%", fontSize: "0.90rem", opacity: 0.09, depth: 0.50 },
  { text: "Seek truth, defend justice",          top: "41%", left: "81%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Equal protection under law",          top: "29%", left: "68%", fontSize: "0.88rem", opacity: 0.09, depth: 0.40 },
  { text: "Stare decisis",                       top: "44%", left: "91%", fontSize: "1.00rem", opacity: 0.10, depth: 0.30 },
  { text: "Habeas corpus",                       top: "37%", left: "63%", fontSize: "1.10rem", opacity: 0.11, depth: 0.55 },
  { text: "Per curiam",                          top: "52%", left: "78%", fontSize: "0.90rem", opacity: 0.08, depth: 0.45 },
  // Bottom zone
  { text: "Justice without mercy is cruelty",    top: "57%", left: "3%",  fontSize: "1.10rem", opacity: 0.12, depth: 0.30 },
  { text: "Equity demands fairness",             top: "66%", left: "60%", fontSize: "0.88rem", opacity: 0.09, depth: 0.50 },
  { text: "Law is the guardian of liberty",      top: "73%", left: "20%", fontSize: "1.00rem", opacity: 0.10, depth: 0.40 },
  { text: "The scales must be balanced",         top: "61%", left: "38%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Fairness is the essence of law",      top: "69%", left: "76%", fontSize: "0.88rem", opacity: 0.09, depth: 0.35 },
  { text: "Uphold the dignity of the law",       top: "76%", left: "4%",  fontSize: "1.00rem", opacity: 0.11, depth: 0.45 },
  { text: "Every right deserves a defense",      top: "63%", left: "22%", fontSize: "0.85rem", opacity: 0.08, depth: 0.55 },
  { text: "Power must be held accountable",      top: "71%", left: "55%", fontSize: "0.90rem", opacity: 0.09, depth: 0.30 },
  { text: "Let the punishment fit the crime",    top: "55%", left: "48%", fontSize: "0.85rem", opacity: 0.08, depth: 0.50 },
  { text: "Truth, the daughter of time",         top: "74%", left: "68%", fontSize: "0.82rem", opacity: 0.08, depth: 0.40 },
  { text: "Justice is the end of government",    top: "58%", left: "16%", fontSize: "0.90rem", opacity: 0.09, depth: 0.55 },
  { text: "The law is reason free from passion", top: "67%", left: "40%", fontSize: "0.85rem", opacity: 0.08, depth: 0.35 },
  { text: "No one is exempt from the law",       top: "75%", left: "45%", fontSize: "0.88rem", opacity: 0.09, depth: 0.45 },
  { text: "Res ipsa loquitur",                   top: "60%", left: "82%", fontSize: "0.92rem", opacity: 0.09, depth: 0.50 },
  { text: "Mens rea",                            top: "70%", left: "8%",  fontSize: "1.05rem", opacity: 0.10, depth: 0.60 },
  { text: "Ex post facto",                       top: "64%", left: "67%", fontSize: "0.85rem", opacity: 0.08, depth: 0.35 },
  // Extended bottom zone (77–87%)
  { text: "Volenti non fit injuria",             top: "78%", left: "55%", fontSize: "0.88rem", opacity: 0.09, depth: 0.45 },
  { text: "Pacta sunt servanda",                 top: "80%", left: "15%", fontSize: "0.85rem", opacity: 0.08, depth: 0.35 },
  { text: "Nemo dat quod non habet",             top: "83%", left: "70%", fontSize: "0.80rem", opacity: 0.08, depth: 0.50 },
  { text: "Caveat emptor",                       top: "85%", left: "38%", fontSize: "0.92rem", opacity: 0.09, depth: 0.30 },
  { text: "Omnia praesumuntur rite esse acta",   top: "79%", left: "2%",  fontSize: "0.80rem", opacity: 0.08, depth: 0.55 },
  { text: "In dubio pro reo",                    top: "82%", left: "84%", fontSize: "0.85rem", opacity: 0.08, depth: 0.40 },
  { text: "Dura lex sed lex",                    top: "87%", left: "22%", fontSize: "0.90rem", opacity: 0.09, depth: 0.35 },
]

// ─── Newspaper headlines — bold, uppercase, with rule ─────────────────────────

const NEWSPAPER_HEADLINES: BgItem[] = [
  // Top zone
  { text: "SUPREME COURT UPHOLDS CONSTITUTIONAL RIGHTS",     top: "5%",  left: "29%", fontSize: "0.70rem", opacity: 0.08, depth: 0.35 },
  { text: "LANDMARK CASE SETS NEW PRECEDENT IN PROPERTY LAW",top: "18%", left: "38%", fontSize: "0.65rem", opacity: 0.07, depth: 0.45 },
  { text: "ATTORNEY GENERAL ANNOUNCES MAJOR LEGAL REFORMS",  top: "12%", left: "2%",  fontSize: "0.67rem", opacity: 0.07, depth: 0.40 },
  // Left band
  { text: "HIGH COURT GRANTS INJUNCTION IN MAJOR DISPUTE",   top: "36%", left: "2%",  fontSize: "0.66rem", opacity: 0.08, depth: 0.50 },
  { text: "JUDICIAL COMMISSION LAUNCHES SWEEPING REFORMS",   top: "48%", left: "5%",  fontSize: "0.64rem", opacity: 0.07, depth: 0.40 },
  // Right band
  { text: "COMMERCIAL COURT RECORDS HISTORIC VERDICT",       top: "31%", left: "62%", fontSize: "0.66rem", opacity: 0.08, depth: 0.30 },
  { text: "NEW ARBITRATION LAWS TO STREAMLINE DISPUTES",     top: "47%", left: "67%", fontSize: "0.64rem", opacity: 0.07, depth: 0.45 },
  { text: "APPELLATE DIVISION OVERTURNS LOWER COURT RULING", top: "38%", left: "72%", fontSize: "0.64rem", opacity: 0.07, depth: 0.35 },
  // Bottom zone
  { text: "ATTORNEY GENERAL DEFENDS PUBLIC INTEREST",        top: "57%", left: "33%", fontSize: "0.68rem", opacity: 0.08, depth: 0.35 },
  { text: "CORPORATE MERGER FACES REGULATORY SCRUTINY",      top: "65%", left: "45%", fontSize: "0.64rem", opacity: 0.07, depth: 0.55 },
  { text: "COURT OF APPEAL RULES ON CONTRACT DISPUTE",       top: "72%", left: "33%", fontSize: "0.66rem", opacity: 0.08, depth: 0.40 },
  { text: "NEW COMPLIANCE FRAMEWORK FOR CORPORATE SECTOR",   top: "62%", left: "56%", fontSize: "0.64rem", opacity: 0.07, depth: 0.30 },
  { text: "PARLIAMENT PASSES LANDMARK CIVIL LIBERTIES BILL", top: "68%", left: "4%",  fontSize: "0.66rem", opacity: 0.08, depth: 0.50 },
  // Extended bottom zone
  { text: "JUDICIARY DEFENDS INDEPENDENCE OF COURTS",       top: "78%", left: "48%", fontSize: "0.66rem", opacity: 0.08, depth: 0.35 },
  { text: "NEW LEGAL AID BILL PASSES IN PARLIAMENT",        top: "83%", left: "10%", fontSize: "0.64rem", opacity: 0.07, depth: 0.45 },
  { text: "INTERNATIONAL ARBITRATION SEES RECORD GROWTH",   top: "86%", left: "58%", fontSize: "0.64rem", opacity: 0.07, depth: 0.40 },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroV2() {
  const [mounted,    setMounted]    = useState(false)
  const [appLoaded,  setAppLoaded]  = useState(false)

  // Delay render of background items to avoid SSR hydration mismatch
  useEffect(() => {
    const mountId = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(mountId)
  }, [])

  // Watch for the app-loaded class added by HomeLoadingScreen when it begins
  // fading — this triggers the quote/headline fall-in entrance animation.
  useEffect(() => {
    const check = () => {
      if (document.body.classList.contains('app-loaded')) setAppLoaded(true)
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <section className={styles.hero} data-hero-section="true">

      {/* ── Legal maxims — italic serif ────────────────────────────────────── */}
      {mounted && LEGAL_QUOTES.map((q, i) => (
        <div
          key={`q-${i}`}
          className={`${styles.bgItemWrapper} ${appLoaded ? styles.bgItemVisible : ''}`}
          aria-hidden="true"
          style={{
            top:  q.top,
            left: q.left,
            '--entrance-delay': `${i * 10}ms`,
          } as React.CSSProperties}
        >
          <p
            className={styles.parallaxQuote}
            style={{
              fontSize:  q.fontSize,
              opacity:   q.opacity,
              '--depth': String(q.depth),
            } as React.CSSProperties}
          >
            {q.text}
          </p>
        </div>
      ))}

      {/* ── Newspaper headlines — bold uppercase with rule ─────────────────── */}
      {mounted && NEWSPAPER_HEADLINES.map((h, i) => (
        <div
          key={`n-${i}`}
          className={`${styles.bgItemWrapper} ${appLoaded ? styles.bgItemVisible : ''}`}
          aria-hidden="true"
          style={{
            top:  h.top,
            left: h.left,
            '--entrance-delay': `${(LEGAL_QUOTES.length + i) * 10}ms`,
          } as React.CSSProperties}
        >
          <p
            className={styles.parallaxHeadline}
            style={{
              fontSize:  h.fontSize,
              opacity:   h.opacity,
              '--depth': String(h.depth),
            } as React.CSSProperties}
          >
            {h.text}
          </p>
        </div>
      ))}

      {/* ── Centre: AR&CO above tagline ────────────────────────────────────── */}
      {mounted && (
        <div className={styles.centerWrapper}>
          <p className={styles.centerBrand} aria-hidden="true">AR&amp;CO</p>
          <p className={styles.centerLabel}  aria-hidden="true">Top Law Associates</p>
        </div>
      )}

      {/* ── Full-width brand name — flush with viewport bottom ─────────────── */}
      <div className={styles.brandBottom}>

        {/* Desktop: single line */}


        {/* Mobile: two stacked lines */}


      </div>
    </section>
  )
}
