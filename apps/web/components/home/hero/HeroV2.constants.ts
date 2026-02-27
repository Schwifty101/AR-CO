/**
 * Parallax law maxims distributed across the HeroV2 background.
 * Positions avoid the central video square (≈ left 43-57%, top 27-52%)
 * and the AR&CO text band at the bottom (top > 78%).
 * Only font-size varies — no rotation.
 */

export interface QuoteItem {
  text: string
  top: string
  left: string
  fontSize: string
  /** alpha 0–1 */
  opacity: number
  /** parallax depth multiplier — higher = more mouse drift */
  depth: number
}

export const PARALLAX_QUOTES: QuoteItem[] = [
  // ── Top zone (top 3-26%) ────────────────────────────────────────────────
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

  // ── Left side (top 27-52%, left 0-38%) ──────────────────────────────────
  { text: "Rights must be protected",            top: "30%", left: "2%",  fontSize: "1.00rem", opacity: 0.10, depth: 0.55 },
  { text: "Due process of law",                  top: "46%", left: "4%",  fontSize: "1.10rem", opacity: 0.11, depth: 0.40 },
  { text: "The law must be fair",                top: "38%", left: "12%", fontSize: "0.85rem", opacity: 0.09, depth: 0.70 },
  { text: "Justice must be seen to be done",     top: "34%", left: "20%", fontSize: "0.82rem", opacity: 0.08, depth: 0.50 },
  { text: "Presumption of innocence",            top: "51%", left: "8%",  fontSize: "0.92rem", opacity: 0.09, depth: 0.45 },
  { text: "No punishment without law",           top: "43%", left: "1%",  fontSize: "0.88rem", opacity: 0.08, depth: 0.60 },
  { text: "The burden of proof",                 top: "28%", left: "30%", fontSize: "1.00rem", opacity: 0.09, depth: 0.35 },

  // ── Right side (top 27-52%, left 62-95%) ────────────────────────────────
  { text: "Liberty under law",                   top: "33%", left: "65%", fontSize: "1.05rem", opacity: 0.10, depth: 0.30 },
  { text: "All are equal before the law",        top: "49%", left: "72%", fontSize: "0.90rem", opacity: 0.09, depth: 0.50 },
  { text: "Seek truth, defend justice",          top: "41%", left: "81%", fontSize: "0.82rem", opacity: 0.08, depth: 0.60 },
  { text: "Equal protection under law",          top: "29%", left: "68%", fontSize: "0.88rem", opacity: 0.09, depth: 0.40 },
  { text: "Stare decisis",                       top: "44%", left: "91%", fontSize: "1.00rem", opacity: 0.10, depth: 0.30 },
  { text: "Habeas corpus",                       top: "37%", left: "63%", fontSize: "1.10rem", opacity: 0.11, depth: 0.55 },
  { text: "Per curiam",                          top: "52%", left: "78%", fontSize: "0.90rem", opacity: 0.08, depth: 0.45 },

  // ── Bottom zone (top 54-76%) ─────────────────────────────────────────────
  { text: "Justice without mercy is cruelty",   top: "57%", left: "3%",  fontSize: "1.10rem", opacity: 0.12, depth: 0.30 },
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
]
