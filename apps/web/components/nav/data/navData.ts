/**
 * Navigation Data Constants
 *
 * Centralized navigation data used across Header, SidePanel,
 * FullScreenDropdown, and MobileFullScreenMenu components.
 *
 * Single source of truth - eliminates duplication.
 */

import type { INavItem, INavSection, INavCategory } from '../types/nav.types'

/**
 * Main navigation items (top-level links)
 */
export const NAV_ITEMS: INavItem[] = [
    { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
    { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
    { id: 'practice-areas', label: 'Practice Areas', href: '/practice-areas', hasSubmenu: true },
    { id: 'facilitation', label: 'Facilitation Centre', href: '/facilitation', hasSubmenu: true },
    { id: 'contact', label: 'Contact Us', href: '/contact', hasSubmenu: false },
]

/**
 * Practice Areas navigation section data
 */
export const PRACTICE_AREAS_DATA: INavSection = {
    title: 'Practice Areas',
    description: 'Our comprehensive legal services',
    categories: [
        {
            title: 'Corporate Law',
            links: [
                { label: 'Company Formation', href: '/practice-areas/company-formation' },
                { label: 'Mergers & Acquisitions', href: '/practice-areas/mergers-acquisitions' },
                { label: 'Corporate Governance', href: '/practice-areas/corporate-governance' },
                { label: 'Joint Ventures', href: '/practice-areas/joint-ventures' },
            ]
        },
        {
            title: 'Litigation',
            links: [
                { label: 'Civil Litigation', href: '/practice-areas/civil-litigation' },
                { label: 'Criminal Defense', href: '/practice-areas/criminal-defense' },
                { label: 'Appellate Practice', href: '/practice-areas/appellate-practice' },
                { label: 'Arbitration', href: '/practice-areas/arbitration' },
            ]
        },
        {
            title: 'Real Estate',
            links: [
                { label: 'Property Transactions', href: '/practice-areas/property-transactions' },
                { label: 'Land Disputes', href: '/practice-areas/land-disputes' },
                { label: 'Construction Law', href: '/practice-areas/construction-law' },
                { label: 'Lease Agreements', href: '/practice-areas/lease-agreements' },
            ]
        },
        {
            title: 'Banking & Finance',
            links: [
                { label: 'Banking Regulations', href: '/practice-areas/banking-regulations' },
                { label: 'Project Finance', href: '/practice-areas/project-finance' },
                { label: 'Debt Recovery', href: '/practice-areas/debt-recovery' },
                { label: 'Securities Law', href: '/practice-areas/securities-law' },
            ]
        },
    ]
}

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
                { label: 'NTN / STRN', href: '/facilitation/ntn-strn' },
                { label: 'SECP Registration', href: '/facilitation/secp-registration' },
                { label: 'Partnership Deeds', href: '/facilitation/partnership-deeds' },
                { label: 'Agreements', href: '/facilitation/agreements' },
                { label: 'Bank Documents', href: '/facilitation/bank-documents' },
            ]
        },
        {
            title: 'Compliance Certificates',
            links: [
                { label: 'AML / CFT Certificate', href: '/facilitation/aml-cft' },
                { label: 'Food Authority Licensing', href: '/facilitation/food-authority' },
                { label: 'Environmental Clearance', href: '/facilitation/environmental' },
                { label: 'Fire Compliance', href: '/facilitation/fire-compliance' },
                { label: 'Labour Registration', href: '/facilitation/labour' },
            ]
        },
        {
            title: 'Real Estate Documentation',
            links: [
                { label: 'Property Transfer', href: '/facilitation/property-transfer' },
                { label: 'Fard Verification', href: '/facilitation/fard-verification' },
                { label: 'Rent Agreements', href: '/facilitation/rent-agreements' },
            ]
        },
        {
            title: 'Personal Certificates',
            links: [
                { label: 'Character Certificate', href: '/facilitation/character-certificate' },
                { label: 'Succession Certificate', href: '/facilitation/succession-certificate' },
            ]
        },
        {
            title: "Women's Legal Desk",
            highlight: true,
            links: [
                { label: 'Khula / Divorce', href: '/facilitation/khula-divorce' },
                { label: 'Harassment Complaints', href: '/facilitation/harassment' },
                { label: 'Inheritance Documentation', href: '/facilitation/inheritance' },
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
