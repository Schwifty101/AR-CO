"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { pauseScroll, resumeScroll, getSmoother } from "../../SmoothScroll"
import styles from "./Testimonials.module.css"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface Testimonial {
  company: string
  person: string
  role: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    company: "ARY Communications (Pvt) Ltd",
    person: "Amad Yousuf",
    role: "CEO",
    quote: "During a time of political unrest our institution, ARY Communications PVT LTD, and our valued employees and prominent journalists, such as Arshad Sharif, Kashif Abbasi, Khawar Ghuman etc, had fallen victim to abuse of power by state institutions and their rights guaranteed by the constitution were violated. Barrister Shoaib Razzaq, through his representations before the Islamabad high court in Writ Petition, having case number 187/2022, State Institutions such as ministry of interior and PEMRA exceeded expectations and put an end to the a very difficult time. I strongly recommend Barrister Shoaib Razzaq and his law firm for his formidable understanding of legal issues, strategic planning and ability to convey the message."
  },
  {
    company: "China National Petroleum Company (CNPC)",
    person: "Houliang Dai",
    role: "Executive Chairman",
    quote: "We are a Chinese Petroleum Company; we had been engaged by Pakistan to provide Drilling services to tap into the natural resources of Pakistan. During the course of carrying out our obligations, we were at an impass between Pakistan Petroleum Exploration PVT LTD. We engaged A.R. & Co. as our attorney to represent our interest before the courts in Pakistan. We were satisfied by the Quality of services that A.R. & Co. provided, they conducted themselves in a professional manner and paved the way to resolve the matter. We would strongly recommend Mr. Razzaq as legal counsel anyone who is looking for brilliant corporate lawyer."
  },
  {
    company: "Senior Journalist",
    person: "Moeed Pirzada",
    role: "Journalist",
    quote: "Barrister Shoaib Razzaq and A.R. & Co. represented me in several highly sensitive and politically motivated matters, including proceedings before the superior courts and representations before state institutions, as well as cases before the Anti-Terrorism Courts. At a time when support was scarce and the circumstances were exceptionally challenging, Shoaib Razzaq responded decisively and stood by us. He handled each matter with courage, strategic clarity, and unwavering commitment. His legal acumen, professionalism, and resolve during difficult times earned our deep respect and trust."
  },
  {
    company: "Senior Journalist",
    person: "Sabir Shakir",
    role: "Journalist",
    quote: "I engaged Barrister Shoaib Razzaq and A.R. & Co. in several highly sensitive and politically charged legal matters, including proceedings before the superior courts, representations before state institutions, and cases before the Anti-Terrorism Courts. During a period marked by intense pressure and limited support, Shoaib Razzaq demonstrated exceptional resolve and decisiveness. He stood firmly by us, navigated complex legal terrain with strategic clarity, and handled every matter with courage and professionalism. His legal insight, composure under pressure, and unwavering commitment earned my complete trust and respect."
  },
  {
    company: "Senior Journalist",
    person: "Hamid Mir",
    role: "Journalist",
    quote: "I have great respect for barrister Shoaib. Whensoever I have found myself in a situation where I need his help, he always delivered. He has great understanding of the law, situational awareness and sound judgement which allows him to exercise his legal talents under extreme pressure in high stakes situations."
  },
  {
    company: "David Game College London",
    person: "David Game",
    role: "Director",
    quote: "I was faced with a situation where my intellectual property was being unlawfully used, and my rights were being infringed with no apparent remedy. I approached A.R.& Co., who acted promptly and strategically to protect my interests. Through their representation the issue was amicably resolved. I strongly recommend the team at A.R. & Co. as intellectual property attorneys."
  },
  {
    company: "Easy Home Movers, UAE",
    person: "Dr. Dosist",
    role: "",
    quote: "A.R. & Co. was an effective advocate for us. Together, we achieved a rapid, successful transaction that served both the seller's interests and our own, with an exceptional level of skill and professionalism demonstrated throughout the process."
  },
  {
    company: "Safa Gold Mall",
    person: "",
    role: "",
    quote: "A.R. & Co. has been our go to law firm for nearly a decade, they handle all our legal matters, whether it be dealing with regulatory authorities, tenants or internal corporate matters. Their work has always been satisfactory and we would recommend them to anyone who seeks sound legal advice and representation"
  },
  {
    company: "Centaurus Mall",
    person: "",
    role: "",
    quote: "Barrister Shoaib Razzaq represented us during the inception of our business venture, He and along with his team represented our interests before different regulatory institutions and negotiated on our behalf for the licensing and all other legal compliance. We are content with the services of Mr. Razzaq and recommend him with confidence to anyone who needs legal services."
  },
  {
    company: "KMS (Pvt) LTD",
    person: "Saqib Saffdar",
    role: "",
    quote: "In a complex dispute over the NPT Building in F-8 involving multiple partners, the firm represented us with exceptional precision and authority. Their handling of the suit for specific performance, declaration, and rendition of accounts was strategic, fearless, and results-driven. Truly outstanding advocacy in high-stakes property litigation."
  },
  // Additional testimonials to make 12
  {
    company: "Senior Journalist",
    person: "Akbar Hussain",
    role: "Journalist",
    quote: "Barrister Shoaib Razzaq and A.R. & Co. represented me in several complex and sensitive legal matters, including proceedings before the superior courts, engagements with state authorities, and cases before the Anti-Terrorism Courts. When the environment was hostile and support was limited, Shoaib Razzaq remained resolute and proactive. He approached each matter with precision, strategic foresight, and unwavering dedication. His professionalism, legal acumen, sound judgment, and commitment during challenging times earned my deep respect and confidence."
  },
  {
    company: "Senior Journalist",
    person: "Moeed Pirzada",
    role: "Journalist",
    quote: "I was represented by Barrister Shoaib Razzaq and A.R. & Co. in multiple high-stakes and politically sensitive matters, spanning litigation before the superior judiciary, proceedings involving state institutions, and cases before the Anti-Terrorism Courts. At a time when circumstances were extraordinarily difficult and the risks were significant, Shoaib Razzaq responded with confidence, clarity, and steadfast support. His strategic approach, legal acumen, and principled advocacy reflected a rare level of professionalism. He proved to be a lawyer of courage and integrity, deserving of the highest regard."
  }
]

// Split testimonials into 3 columns (4 each)
const column1 = testimonials.slice(0, 4)
const column2 = testimonials.slice(4, 8)
const column3 = testimonials.slice(8, 12)

interface TestimonialCardProps {
  testimonial: Testimonial
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Truncate quote to first 200 characters
  const truncatedQuote = testimonial.quote.length > 200
    ? testimonial.quote.substring(0, 200) + "..."
    : testimonial.quote

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.company}>{testimonial.company}</h3>
        {testimonial.person && (
          <p className={styles.person}>
            {testimonial.person}
            {testimonial.role && <span className={styles.role}> · {testimonial.role}</span>}
          </p>
        )}
      </div>
      <div className={styles.quoteContainer}>
        <span className={styles.openQuote}>"</span>
        <p className={styles.quote}>{truncatedQuote}</p>
        <span className={styles.closeQuote}>"</span>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyWrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const column1Ref = useRef<HTMLDivElement>(null)
  const column2Ref = useRef<HTMLDivElement>(null)
  const column3Ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current || !stickyWrapperRef.current) return
    if (!column1Ref.current || !column2Ref.current || !column3Ref.current) return

    const section = sectionRef.current
    const title = titleRef.current
    const column1 = column1Ref.current
    const column2 = column2Ref.current
    const column3 = column3Ref.current

    // Initial reveal animations
    // Animate title
    gsap.fromTo(title,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 0.95,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    )

    // Animate all cards with stagger
    const allCards = [
      ...column1.querySelectorAll(`.${styles.card}`),
      ...column2.querySelectorAll(`.${styles.card}`),
      ...column3.querySelectorAll(`.${styles.card}`)
    ]

    gsap.fromTo(allCards,
      {
        opacity: 0,
        y: 60,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: "start",
          ease: "power2.out"
        },
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    )

    // Auto-pause when testimonials section is fully in frame
    let hasTriggeredPause = false

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onLeave: () => { hasTriggeredPause = false },
      onLeaveBack: () => { hasTriggeredPause = false },
    })

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "top top",
      onEnter: () => {
        if (!hasTriggeredPause) {
          hasTriggeredPause = true
          pauseScroll()
          setTimeout(() => {
            // Capture position before resuming to kill accumulated momentum
            const smoother = getSmoother()
            const currentPos = smoother?.scrollTop() ?? 0
            resumeScroll()
            // Snap back to where we paused so momentum doesn't carry over
            smoother?.scrollTo(currentPos, false)
          }, 800)
        }
      },
    })

    // Calculate scroll distance based on column heights
    const scrollDistance = column1.scrollHeight * 0.6

    // Create parallax scroll effect - left/right columns move faster than middle
    // No pinning - everything scrolls naturally but at different speeds
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
      }
    })

    // Left and right columns scroll faster (larger negative Y movement)
    // Middle column scrolls slower (smaller negative Y movement)
    tl.to(column1, {
      y: -scrollDistance * 1.3, // 30% faster
      ease: "none"
    }, 0)
    .to(column2, {
      y: -scrollDistance * 0.7, // 30% slower (middle column)
      ease: "none"
    }, 0)
    .to(column3, {
      y: -scrollDistance * 1.3, // 30% faster
      ease: "none"
    }, 0)

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === section) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.testimonials}>
      <div ref={stickyWrapperRef} className={styles.stickyWrapper}>
        {/* Title */}
        <div className={styles.titleContainer}>
          <h1 ref={titleRef} className={styles.title}>Testimonials</h1>
        </div>

        {/* Three columns */}
        <div className={styles.columnsContainer}>
          {/* Left Column - Scrolls Down */}
          <div ref={column1Ref} className={styles.column}>
            {column1.map((testimonial, index) => (
              <TestimonialCard key={`col1-${index}`} testimonial={testimonial} />
            ))}
          </div>

          {/* Middle Column - Scrolls Up */}
          <div ref={column2Ref} className={`${styles.column} ${styles.middleColumn}`}>
            {column2.map((testimonial, index) => (
              <TestimonialCard key={`col2-${index}`} testimonial={testimonial} />
            ))}
          </div>

          {/* Right Column - Scrolls Down */}
          <div ref={column3Ref} className={styles.column}>
            {column3.map((testimonial, index) => (
              <TestimonialCard key={`col3-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className={styles.decorativeElements}>
          <div className={styles.gradientOrb} />
          <div className={styles.gridOverlay} />
        </div>
      </div>
    </section>
  )
}
