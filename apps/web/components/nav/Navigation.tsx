"use client"

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV_ITEMS, SIDEPANEL_FOOTER_NAV_ITEMS, FACILITATION_DATA, PRACTICE_AREAS_DATA } from '../data/navData'
import type { INavItem, INavCategory } from './types/nav.types'
import styles from './Navigation.module.css'
import SlotMachineText from "@/components/shared/animations/SlotMachineText"
import { usePracticeAreasOverlay } from '../practice-areas'
import { useFacilitationOverlay } from '../facilitation'

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
}

// --- Animation Constants ---
const TRANSITION_SMOOTH = { duration: 0.6, ease: [0.33, 1, 0.68, 1] as const }
const TRANSITION_DRAMATIC = { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const }

// --- Shared Components ---

/**
 * Logo component displaying AR&CO branding
 * Supports both image and text variants with mix-blend-difference
 */
interface ILogoProps {
    /** Additional CSS classes */
    className?: string
    /** Whether to show text-only version */
    textOnly?: boolean
}

const Logo: React.FC<ILogoProps> = ({ className = "", textOnly = false }) => {
    if (textOnly) {
        return (
            <Link
                href="/"
                className={`${styles.logo} ${className}`}
                aria-label="AR&CO Law Firm - Return to homepage"
            >
                AR&CO
            </Link>
        )
    }

    return (
        <Link
            href="/"
            className={className}
            aria-label="AR&CO Law Firm - Return to homepage"
        >
            <Image
                src="/assets/logos/main-logo.png"
                alt="AR&CO Law Associates"
                width={120}
                height={100}
                className={styles.logoImage}
                priority
            />
        </Link>
    )
}

/**
 * CTA Button component with filled and outline variants
 * Uses project heritage colors for consistency
 */
interface ICtaButtonProps {
    /** Button text */
    text?: string
    /** Click handler */
    onClick?: () => void
    /** Visual variant */
    variant?: "filled" | "outline"
    /** Link destination (optional) */
    href?: string
    /** Additional CSS classes */
    className?: string
}

const CtaButton: React.FC<ICtaButtonProps> = ({
    text = "BOOK CONSULTATION",
    onClick,
    variant = "filled",
    href = "/consultation",
    className = ""
}) => {
    const buttonClasses = `${styles.ctaButton} ${variant === "filled" ? styles.ctaButtonFilled : styles.ctaButtonOutline} ${className}`

    const content = (
        <>
            {text}
            <ArrowUpRight size={14} className={styles.ctaIcon} />
        </>
    )

    if (href && !onClick) {
        return (
            <Link href={href} className={buttonClasses}>
                {content}
            </Link>
        )
    }

    return (
        <button onClick={onClick} className={buttonClasses}>
            {content}
        </button>
    )
}

// --- Hero Navbar (Initial State - visible before scroll) ---

interface IHeroNavbarProps {
    /** Whether the navbar should be hidden */
    isHidden: boolean
    /** Whether the navbar has completed entrance animation */
    hasEntered: boolean
    /** Navigation items to display */
    navItems: INavItem[]
    /** Handler for menu button click (mobile) */
    onMenuClick: () => void
    /** Handler to open practice areas overlay */
    onOpenPracticeAreas: () => void
    /** Handler to open facilitation services overlay */
    onOpenFacilitation: () => void
}

const HeroNavbar: React.FC<IHeroNavbarProps> = ({ isHidden, hasEntered, navItems, onMenuClick, onOpenPracticeAreas, onOpenFacilitation }) => {
    return (
        <motion.nav
            initial={{ y: "-100%", opacity: 0 }}
            animate={{
                y: (isHidden || !hasEntered) ? "-100%" : "0%",
                opacity: (isHidden || !hasEntered) ? 0 : 1
            }}
            transition={hasEntered ? TRANSITION_SMOOTH : { duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className={styles.heroNavbar}
        >
            <div className={styles.heroNavbarInner}>
                <Logo />

                {/* Center Links - Desktop Only */}
                <div className={styles.centerNav}>
                    {navItems.map((link) => (
                        link.id === 'practice-areas' ? (
                            <button
                                key={link.id}
                                onClick={onOpenPracticeAreas}
                                className={styles.navLink}
                            >
                                {link.label}
                            </button>
                        ) : link.id === 'facilitation' ? (
                            <button
                                key={link.id}
                                onClick={onOpenFacilitation}
                                className={styles.navLink}
                            >
                                {link.label}
                            </button>
                        ) : (
                            <Link
                                key={link.id}
                                href={link.href}
                                className={styles.navLink}
                            >
                                {link.label}
                            </Link>
                        )
                    ))}
                </div>

                {/* Right CTA - Desktop Only */}
                <div className="hidden lg:block">
                    <CtaButton variant="outline" />
                </div>

                {/* Mobile Menu Indicator - shows on smaller screens */}
                <button
                    className={styles.mobileMenuIndicator}
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                >
                    MENU
                </button>
            </div>
        </motion.nav>
    )
}

// --- Sticky Navbar (Scrolled State - CTA + Hamburger) ---

interface IStickyNavbarProps {
    /** Whether the sticky navbar is visible */
    isVisible: boolean
    /** Handler for menu button click */
    onMenuClick: () => void
}

const StickyNavbar: React.FC<IStickyNavbarProps> = ({ isVisible, onMenuClick }) => {
    return (
        <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{
                y: isVisible ? "0%" : "-100%",
                opacity: isVisible ? 1 : 0
            }}
            transition={{ ...TRANSITION_SMOOTH, duration: 0.5 }}
            className={styles.stickyNavbar}
        >
            <div className={`${styles.stickyContent} hidden md:block`}>
                <CtaButton variant="filled" />
            </div>

            <motion.button
                onClick={onMenuClick}
                className={styles.menuToggle}
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
                aria-label="Open navigation menu"
            >
                <Menu size={20} strokeWidth={2.5} />
            </motion.button>
        </motion.div>
    )
}

// --- Full Screen Menu (Overlay) ---

interface IFullScreenMenuProps {
    /** Handler for closing the menu */
    onClose: () => void
    /** Navigation items to display */
    navItems: INavItem[]
    /** Handler to open practice areas overlay */
    onOpenPracticeAreas: () => void
    /** Handler to open facilitation services overlay */
    onOpenFacilitation: () => void
}

const FullScreenMenu: React.FC<IFullScreenMenuProps> = ({ onClose, navItems, onOpenPracticeAreas, onOpenFacilitation }) => {
    const [isMobile, setIsMobile] = useState(false)
    const [hoveredLink, setHoveredLink] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState<string>('')
    const [isOfficeOpen, setIsOfficeOpen] = useState<boolean>(false)

    // Check viewport on mount to determine animation origin
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    // Live clock effect - updates every second with Pakistan timezone
    useEffect(() => {
        const calculateOfficeStatus = (pktDate: Date): boolean => {
            const dayOfWeek = pktDate.getDay()
            const hours = pktDate.getHours()
            const minutes = pktDate.getMinutes()
            const currentMinutes = hours * 60 + minutes
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
            const isBusinessHours = currentMinutes >= 540 && currentMinutes < 1020
            return isWeekday && isBusinessHours
        }

        const updateClock = () => {
            const now = new Date()
            const pktTime = new Date(
                now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
            )
            const timeString = pktTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
            setCurrentTime(`${timeString} PKT`)
            setIsOfficeOpen(calculateOfficeStatus(pktTime))
        }

        updateClock()
        const interval = setInterval(updateClock, 1000)
        return () => clearInterval(interval)
    }, [])

    const containerVariants: Variants = {
        initial: (mobile: boolean) => ({
            clipPath: mobile
                ? "circle(0px at calc(100% - 40px) 40px)"
                : "circle(0px at calc(100% - 72px) 48px)",
            opacity: 0
        }),
        animate: (mobile: boolean) => ({
            clipPath: mobile
                ? "circle(150% at calc(100% - 40px) 40px)"
                : "circle(150% at calc(100% - 72px) 48px)",
            opacity: 1,
            transition: TRANSITION_DRAMATIC
        }),
        exit: (mobile: boolean) => ({
            clipPath: mobile
                ? "circle(0px at calc(100% - 40px) 40px)"
                : "circle(0px at calc(100% - 72px) 48px)",
            opacity: 0,
            transition: {
                ...TRANSITION_DRAMATIC,
                duration: 0.6,
                delay: 0.1
            }
        })
    }

    const linkContainerVariants: Variants = {
        animate: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        },
        exit: {
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    }

    const linkVariants: Variants = {
        initial: { y: "100%", opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: TRANSITION_DRAMATIC
        },
        exit: { y: "100%", opacity: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            custom={isMobile}
            initial="initial"
            animate="animate"
            exit="exit"
            className={styles.fullScreenMenu}
        >
            {/* Menu Header */}
            <div className={styles.menuHeader}>
                <Logo />

                <div className={styles.menuHeaderActions}>
                    <div className="hidden md:block">
                        <CtaButton variant="outline" />
                    </div>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close navigation menu"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Navigation Links with Facilitation Dropdown - Two Column Layout */}
            <div className={styles.menuContent}>
                {/* Left Column - Navigation Items */}
                <motion.nav
                    variants={linkContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={styles.menuNav}
                    aria-label="Main navigation"
                >
                    {navItems.map((link) => (
                        <div
                            key={link.id}
                            className={styles.menuLinkWrapper}
                            onMouseEnter={() => (link.id === 'facilitation' || link.id === 'practice-areas') && setHoveredLink(link.id)}
                            onMouseLeave={() => (link.id === 'facilitation' || link.id === 'practice-areas') && setHoveredLink(null)}
                        >
                            <motion.div variants={linkVariants}>
                                {link.id === 'practice-areas' ? (
                                    <button
                                        className={styles.menuLink}
                                        onClick={() => {
                                            onClose()
                                            onOpenPracticeAreas()
                                        }}
                                    >
                                        <SlotMachineText>{link.label}</SlotMachineText>
                                    </button>
                                ) : link.id === 'facilitation' ? (
                                    <button
                                        className={styles.menuLink}
                                        onClick={() => {
                                            onClose()
                                            onOpenFacilitation()
                                        }}
                                    >
                                        <SlotMachineText>{link.label}</SlotMachineText>
                                    </button>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className={styles.menuLink}
                                        onClick={onClose}
                                    >
                                        <SlotMachineText>{link.label}</SlotMachineText>
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </motion.nav>

                {/* Right Column - Dropdown Content */}
                <div className={styles.rightColumn}>
                    <AnimatePresence mode="wait">
                        {(hoveredLink === 'facilitation' || hoveredLink === 'practice-areas') && (
                            <motion.div
                                key={hoveredLink}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                className={styles.facilitationDropdown}
                                onMouseEnter={() => setHoveredLink(hoveredLink)}
                                onMouseLeave={() => setHoveredLink(null)}
                            >
                                <div className={styles.dropdownContent}>
                                    <h3 className={styles.dropdownTitle}>
                                        {hoveredLink === 'practice-areas' ? PRACTICE_AREAS_DATA.title : FACILITATION_DATA.title}
                                    </h3>
                                    <p className={styles.dropdownDescription}>
                                        {hoveredLink === 'practice-areas' ? PRACTICE_AREAS_DATA.description : FACILITATION_DATA.description}
                                    </p>
                                    <div className={styles.dropdownGrid}>
                                        {(hoveredLink === 'practice-areas' ? PRACTICE_AREAS_DATA.categories : FACILITATION_DATA.categories).map((category: INavCategory, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`${styles.dropdownCategory} ${category.title === "Women's Legal Desk" ? styles.categorySpanTwo : ''}`}
                                            >
                                                <h4 className={`${styles.categoryTitle} ${category.highlight ? styles.categoryHighlight : ''}`}>
                                                    {category.title}
                                                </h4>
                                                <ul className={styles.categoryLinks}>
                                                    {category.links.map((link, linkIdx) => (
                                                        <li key={linkIdx}>
                                                            <Link
                                                                href={link.href}
                                                                className={styles.categoryLink}
                                                                onClick={onClose}
                                                            >
                                                                {link.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Menu Footer - Matches Footer.tsx layout */}
            <div className={styles.bottomRow}>
                {/* Left Group - Copyright, Time, Status */}
                <div className={styles.bottomLeft}>
                    <SlotMachineText className={`${styles.copyright} cursor-pointer`}>{"© 2026 AR&CO"}</SlotMachineText>
                    <div className={styles.timeStatusRow}>
                        <span className={styles.clockTime}>{currentTime}</span>
                        <span
                            className={`${styles.officeStatus} ${isOfficeOpen ? styles.statusOpen : styles.statusClosed}`}
                        >
                            {isOfficeOpen ? 'WE ARE OPEN' : 'WE ARE CLOSED'}
                        </span>
                    </div>
                </div>

                {/* Center Group - Legal Links */}
                <div className={styles.bottomCenter}>
                    <Link href="/privacy" className={styles.legalLink}>
                        <SlotMachineText>Privacy Policy</SlotMachineText>
                    </Link>
                    <Link href="/terms" className={styles.legalLink}>
                        <SlotMachineText>Terms of Service</SlotMachineText>
                    </Link>
                </div>

                {/* Right Group - Social & Credits */}
                <div className={styles.bottomRight}>
                    <a
                        href="https://instagram.com/arco.law"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                    >
                        <SlotMachineText>Instagram</SlotMachineText>
                    </a>
                    <a
                        href="https://Linkedin.com/arco.law"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                    >
                        <SlotMachineText>LinkedIn</SlotMachineText>
                    </a>
                    <a
                        href="https://Facebook.com/arco.law"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                    >
                        <SlotMachineText>Facebook</SlotMachineText>
                    </a>
                    <span className={`${styles.credits} cursor-pointer`}>SITE BY <SlotMachineText>SCHWIFTY</SlotMachineText></span>
                </div>
            </div>
        </motion.div>
    )
}

// --- Main Navigation Component ---

/**
 * Navigation Component
 *
 * Implements a three-state navigation system:
 * 1. HeroNavbar - Full navbar with links (before scroll)
 * 2. StickyNavbar - Minimal CTA + hamburger (after scroll)
 * 3. FullScreenMenu - Overlay menu (when hamburger clicked)
 *
 * Accounts for hero section's 700vh height with GSAP ScrollTrigger.
 * Uses mix-blend-difference for text visibility over hero content.
 *
 * @example
 * ```tsx
 * // In public layout:
 * <Navigation />
 * ```
 */
export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    // Track which pathname has completed entrance animation
    // hasEntered is derived: true only when enteredPathname matches current pathname
    const [enteredPathname, setEnteredPathname] = useState<string | null>(null)
    const { openOverlay: openPracticeAreasOverlay } = usePracticeAreasOverlay()
    const { openOverlay: openFacilitationOverlay } = useFacilitationOverlay()
    const pathname = usePathname()

    // Derived state: hasEntered is true when current pathname has completed entrance
    const hasEntered = enteredPathname === pathname

    /**
     * Ensure app-loaded class is present on all pages
     * Home page: Wait for LoadingScreen to add it
     * Other pages: Add immediately and trigger entrance animation
     * Using useLayoutEffect for synchronous DOM updates before paint
     */
    useLayoutEffect(() => {
        const isHomePage = pathname === '/'

        if (isHomePage) {
            // On home page, remove app-loaded class to hide navbar during loading
            // LoadingScreen will add it back when loading completes
            document.body.classList.remove('app-loaded')

            // Wait for LoadingScreen to add app-loaded class back
            const observer = new MutationObserver(() => {
                if (document.body.classList.contains('app-loaded')) {
                    // Delay matches LoadingScreen's 1.2s fadeOut transition duration
                    setTimeout(() => setEnteredPathname(pathname), 1200)
                    observer.disconnect()
                }
            })
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
            return () => observer.disconnect()
        } else {
            // On non-home pages, add app-loaded immediately
            if (!document.body.classList.contains('app-loaded')) {
                document.body.classList.add('app-loaded')
            }
            const timer = setTimeout(() => setEnteredPathname(pathname), 50)
            return () => clearTimeout(timer)
        }
    }, [pathname])

    /**
     * Toggle menu open/close with body scroll lock
     */
    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen((prev) => !prev)
    }, [])

    /**
     * Close menu handler
     */
    const handleMenuClose = useCallback(() => {
        setIsMenuOpen(false)
    }, [])

    /**
     * GSAP ScrollTrigger for hero section detection
     * Accounts for 700vh hero height with frame-based animation
     * Re-runs when pathname changes to detect new page's hero section
     */
    useGSAP(() => {
        // Kill existing ScrollTriggers before creating new ones
        ScrollTrigger.getAll().forEach(st => st.kill())

        const setupTrigger = () => {
            // Find hero section by data attribute
            const heroSection = document.querySelector('[data-hero-section="true"]')

            if (heroSection) {
                // Page HAS hero section - show HeroNavbar initially
                setIsScrolled(false)

                ScrollTrigger.create({
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    onUpdate: (self) => {
                        // Show sticky navbar after 5% scroll through hero
                        const shouldBeScrolled = self.progress > 0.05
                        setIsScrolled(shouldBeScrolled)
                    },
                    onLeave: () => setIsScrolled(true),
                    onEnterBack: () => { },
                    onLeaveBack: () => setIsScrolled(false)
                })
            } else {
                // Page has NO hero section - show StickyNavbar (CTA+hamburger) immediately
                setIsScrolled(true)
            }
        }

        // Small delay to ensure DOM is ready after route change
        const timer = setTimeout(setupTrigger, 100)

        return () => {
            clearTimeout(timer)
            ScrollTrigger.getAll().forEach(st => st.kill())
        }
    }, [pathname])

    return (
        <header>
            <HeroNavbar
                isHidden={isScrolled}
                hasEntered={hasEntered}
                navItems={NAV_ITEMS}
                onMenuClick={handleMenuToggle}
                onOpenPracticeAreas={openPracticeAreasOverlay}
                onOpenFacilitation={openFacilitationOverlay}
            />
            <StickyNavbar
                isVisible={isScrolled}
                onMenuClick={handleMenuToggle}
            />
            <AnimatePresence mode="wait">
                {isMenuOpen && (
                    <FullScreenMenu
                        onClose={handleMenuClose}
                        navItems={SIDEPANEL_FOOTER_NAV_ITEMS}
                        onOpenPracticeAreas={openPracticeAreasOverlay}
                        onOpenFacilitation={openFacilitationOverlay}
                    />
                )}
            </AnimatePresence>
        </header>
    )
}