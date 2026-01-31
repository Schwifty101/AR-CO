/**
 * Navigation Data Constants
 *
 * Centralized navigation data used across Header, SidePanel,
 * FullScreenDropdown, and MobileFullScreenMenu components.
 *
 * Single source of truth - eliminates duplication.
 */

import type { INavItem, INavSection, INavCategory } from '../nav/types/nav.types'

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
 * Updated to match all 10 practice areas from PracticeAreasHorizontal component
 */
export const PRACTICE_AREAS_DATA: INavSection = {
    title: 'Practice Areas',
    description: 'Our comprehensive legal services',
    categories: [
        {
            title: 'IP & Innovation',
            links: [
                { label: 'Trademark Registration', href: '/practice-areas/trademark-registration' },
                { label: 'Patent Protection', href: '/practice-areas/patent-protection' },
                { label: 'Copyright Law', href: '/practice-areas/copyright-law' },
                { label: 'IP Enforcement', href: '/practice-areas/ip-enforcement' },
            ]
        },
        {
            title: 'Power & Energy',
            links: [
                { label: 'NEPRA Licensing', href: '/practice-areas/nepra-licensing' },
                { label: 'Power Purchase Agreements', href: '/practice-areas/power-purchase-agreements' },
                { label: 'Energy Regulation', href: '/practice-areas/energy-regulation' },
                { label: 'Tariff Matters', href: '/practice-areas/tariff-matters' },
            ]
        },
        {
            title: 'Oil & Gas',
            links: [
                { label: 'E&P Licensing', href: '/practice-areas/exploration-production-licensing' },
                { label: 'LNG Projects', href: '/practice-areas/lng-projects' },
                { label: 'Pipeline Infrastructure', href: '/practice-areas/pipeline-infrastructure' },
                { label: 'Petroleum Concessions', href: '/practice-areas/petroleum-concessions' },
            ]
        },
        {
            title: 'Renewable Energy',
            links: [
                { label: 'Solar Projects', href: '/practice-areas/solar-projects' },
                { label: 'Wind Power', href: '/practice-areas/wind-power' },
                { label: 'Environmental Compliance', href: '/practice-areas/environmental-compliance' },
                { label: 'Climate Law', href: '/practice-areas/climate-law' },
            ]
        },
        {
            title: 'Dispute Resolution',
            links: [
                { label: 'International Arbitration', href: '/practice-areas/international-arbitration' },
                { label: 'Commercial Litigation', href: '/practice-areas/commercial-litigation' },
                { label: 'FIDIC Disputes', href: '/practice-areas/fidic-disputes' },
                { label: 'Alternative Dispute Resolution', href: '/practice-areas/adr' },
            ]
        },
        {
            title: 'Banking & Finance',
            links: [
                { label: 'Project Finance', href: '/practice-areas/project-finance' },
                { label: 'Corporate Lending', href: '/practice-areas/corporate-lending' },
                { label: 'Debt Restructuring', href: '/practice-areas/debt-restructuring' },
                { label: 'Banking Regulations', href: '/practice-areas/banking-regulations' },
            ]
        },
        {
            title: 'Corporate & M&A',
            links: [
                { label: 'Company Incorporation', href: '/practice-areas/company-incorporation' },
                { label: 'Mergers & Acquisitions', href: '/practice-areas/mergers-acquisitions' },
                { label: 'Joint Ventures', href: '/practice-areas/joint-ventures' },
                { label: 'Corporate Governance', href: '/practice-areas/corporate-governance' },
            ]
        },
        {
            title: 'Tech & Telecom',
            links: [
                { label: 'Telecom Licensing', href: '/practice-areas/telecom-licensing' },
                { label: 'Data Protection', href: '/practice-areas/data-protection' },
                { label: 'Media Law', href: '/practice-areas/media-law' },
                { label: 'Digital Operations', href: '/practice-areas/digital-operations' },
            ]
        },
        {
            title: 'Construction',
            links: [
                { label: 'Construction Contracts', href: '/practice-areas/construction-contracts' },
                { label: 'Real Estate Development', href: '/practice-areas/real-estate-development' },
                { label: 'Infrastructure Projects', href: '/practice-areas/infrastructure-projects' },
                { label: 'Project Management', href: '/practice-areas/project-management' },
            ]
        },
        {
            title: 'Nuclear & Regulatory',
            links: [
                { label: 'Nuclear Licensing', href: '/practice-areas/nuclear-licensing' },
                { label: 'Public International Law', href: '/practice-areas/public-international-law' },
                { label: 'State Liability', href: '/practice-areas/state-liability' },
                { label: 'Regulatory Compliance', href: '/practice-areas/regulatory-compliance' },
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
