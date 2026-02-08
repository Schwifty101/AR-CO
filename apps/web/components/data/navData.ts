/**
 * Navigation Data Constants
 *
 * Centralized navigation data used across Header, SidePanel,
 * FullScreenDropdown, and MobileFullScreenMenu components.
 *
 * Single source of truth - eliminates duplication.
 */

import type { INavItem, INavSection, INavCategory } from '../nav/types/nav.types'
import { practiceAreas } from '@/app/(public)/practice-areas/practiceAreasData'

/**
 * Main navigation items (top-level links)
 * Used in Header component for clean, minimal navigation
 */
export const NAV_ITEMS: INavItem[] = [
    { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
    { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
    { id: 'practice-areas', label: 'Practice Areas', href: '', hasSubmenu: true },
    { id: 'facilitation', label: 'Facilitation Centre', href: '', hasSubmenu: true },
    { id: 'contact', label: 'Contact Us', href: '/contact', hasSubmenu: false },
]

/**
 * Extended navigation items for SidePanel and Footer
 * Includes additional pages (About Us, Case Studies, Blog)
 */
export const SIDEPANEL_FOOTER_NAV_ITEMS: INavItem[] = [
    { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
    { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
    { id: 'about', label: 'About Us', href: '/about', hasSubmenu: false },
    { id: 'case-studies', label: 'Case Studies', href: '/case-studies', hasSubmenu: false },
    { id: 'practice-areas', label: 'Practice Areas', href: '', hasSubmenu: true },
    { id: 'facilitation', label: 'Facilitation Centre', href: '', hasSubmenu: true },
    { id: 'contact', label: 'Contact Us', href: '/contact', hasSubmenu: false },
    { id: 'blog', label: 'Blog', href: '/blog', hasSubmenu: false },
]

/**
 * Generate practice areas navigation from actual data
 * Groups practice areas into logical categories for the dropdown
 */
const generatePracticeAreasCategories = (): INavCategory[] => {
    // Group 1: Intellectual Property & Corporate
    const corporateIP = practiceAreas.filter(pa =>
        ['intellectual-property', 'corporate-commercial', 'banking-financial'].includes(pa.slug)
    )

    // Group 2: Energy Sector
    const energy = practiceAreas.filter(pa =>
        ['generation-sector', 'petroleum-energy-law', 'renewable-energy-environmental', 'nuclear-law'].includes(pa.slug)
    )

    // Group 3: Dispute Resolution & Litigation
    const litigation = practiceAreas.filter(pa =>
        ['alternative-dispute-resolution', 'public-international-extradition'].includes(pa.slug)
    )

    // Group 4: Industry Specific
    const industry = practiceAreas.filter(pa =>
        ['telecommunication-technology-media', 'construction-real-estate', 'engineering-building'].includes(pa.slug)
    )

    // Group 5: Specialized Services
    const specialized = practiceAreas.filter(pa =>
        ['charities-trusts-ngos', 'immigration-law', 'taxation-customs'].includes(pa.slug)
    )

    return [
        {
            title: 'Corporate & Finance',
            links: corporateIP.map(pa => ({
                label: pa.title,
                href: `/practice-areas/${pa.slug}`
            }))
        },
        {
            title: 'Energy & Power',
            links: energy.map(pa => ({
                label: pa.title,
                href: `/practice-areas/${pa.slug}`
            }))
        },
        {
            title: 'Dispute Resolution',
            links: litigation.map(pa => ({
                label: pa.title,
                href: `/practice-areas/${pa.slug}`
            }))
        },
        {
            title: 'Industry Sectors',
            links: industry.map(pa => ({
                label: pa.title,
                href: `/practice-areas/${pa.slug}`
            }))
        },
        {
            title: 'Specialized Services',
            links: specialized.map(pa => ({
                label: pa.title,
                href: `/practice-areas/${pa.slug}`
            }))
        },
    ]
}

/**
 * Practice Areas navigation section data
 * Dynamically generated from actual practice areas data
 */
export const PRACTICE_AREAS_DATA: INavSection = {
    title: 'Practice Areas',
    description: 'Our comprehensive legal services across 15 specialized practice areas',
    categories: generatePracticeAreasCategories(),
}

/**
 * Simple list of all practice areas for footer/mobile menu
 */
export const PRACTICE_AREAS_LIST = practiceAreas.map(pa => ({
    id: pa.slug,
    label: pa.title,
    href: `/practice-areas/${pa.slug}`
}))

/**
 * Facilitation Centre navigation section data
 */
export const FACILITATION_DATA: INavSection = {
    title: 'Facilitation Centre',
    description: 'Legal facilitation services',
    categories: [
        {
            title: 'Business & Corporate',
            links: [
                { label: 'NTN Registration', href: '/facilitation-service/ntn-registration' },
                { label: 'Sales Tax Registration (STRN)', href: '/facilitation-service/sales-tax-registration' },
                { label: 'SECP Registration', href: '/facilitation-service/secp-registration' },
                { label: 'Agreement Drafting', href: '/facilitation-service/agreement-drafting' },
                { label: 'Import / Export License', href: '/facilitation-service/import-export-license' },
                { label: 'Chamber of Commerce Registration', href: '/facilitation-service/chamber-of-commerce-registration' },
            ]
        },
        {
            title: 'Compliance & Licensing',
            links: [
                { label: 'Food Authority License', href: '/facilitation-service/pakistan-food-authority-license' },
                { label: 'DRAP Licensing', href: '/facilitation-service/drap-licensing' },
                { label: 'IHRA Registration', href: '/facilitation-service/ihra-registration' },
                { label: 'IP Registration (Trademark)', href: '/facilitation-service/ip-registration-trademark' },
                { label: 'TV Channel Registration', href: '/facilitation-service/tv-channel-registration' },
                { label: 'Restaurant License', href: '/facilitation-service/restaurant-license-registration' },
            ]
        },
        {
            title: 'Real Estate & Property',
            links: [
                { label: 'Property Transfer', href: '/facilitation-service/property-transfer' },
                { label: 'Tax Filing', href: '/facilitation-service/tax-filing' },
            ]
        },
        {
            title: 'Personal Certificates',
            links: [
                { label: 'Succession Certificate', href: '/facilitation-service/succession-certificate' },
                { label: 'Family Registration Certificate', href: '/facilitation-service/family-registration-certificate' },
                { label: 'Child Registration (B-Form)', href: '/facilitation-service/child-registration-certificate-b-form' },
            ]
        },
        {
            title: "Women's Legal Desk",
            highlight: true,
            links: [
                { label: 'Harassment Cases', href: '/facilitation-service/harassment-cases' },
                { label: 'Family Law (Divorce, Custody)', href: '/facilitation-service/family-law-divorce-custody-maintenance' },
                { label: 'Inheritance & Succession', href: '/facilitation-service/inheritance-succession-matters' },
            ]
        },
        {
            title: 'Overseas Pakistanis',
            highlight: true,
            links: [
                { label: 'Property Verification & Due Diligence', href: '/facilitation-service/property-verification-due-diligence' },
                { label: 'Sale, Purchase & Transfer of Property', href: '/facilitation-service/sale-purchase-transfer-property' },
                { label: 'Property Disputes & Illegal Possession', href: '/facilitation-service/property-disputes-illegal-possession' },
                { label: 'Power of Attorney (POA) Services', href: '/facilitation-service/power-of-attorney-services' },
                { label: 'Family Law (Divorce, Custody, Maintenance)', href: '/facilitation-service/family-law-divorce-custody-maintenance' },
                { label: 'Inheritance & Succession Matters', href: '/facilitation-service/inheritance-succession-matters' },
                { label: 'Civil Litigation & Court Representation', href: '/facilitation-service/civil-litigation-court-representation' },
            ]
        },
    ]
}

/**
 * Combined navigation data map for dropdowns
 */
export const NAV_SECTIONS: Record<'practice-areas' | 'facilitation', INavSection> = {
    'practice-areas': PRACTICE_AREAS_DATA,
    'facilitation': FACILITATION_DATA,
}

/**
 * Submenu data for SidePanel (simplified categories)
 */
export const SUBMENU_DATA: Record<string, { title: string; categories: INavCategory[] }> = {
    'practice-areas': {
        title: 'Practice Areas',
        categories: PRACTICE_AREAS_DATA.categories,
    },
    'facilitation': {
        title: 'Facilitation Centre',
        categories: FACILITATION_DATA.categories,
    },
}
