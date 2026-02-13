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
import { facilitationServices } from '@/components/data/facilitationCenterData'
import { overseasServices } from '@/components/data/overseasServicesData'
import { womenDeskServices } from '@/components/data/womenDeskData'

/** Generates a nav link from a service ID and its category */
function svcLink(category: string, serviceId: string, services: { id: string; title: string }[]) {
    const service = services.find(s => s.id === serviceId)
    return { label: service?.title ?? serviceId, href: `/services/${category}/${serviceId}` }
}

/**
 * Main navigation items (top-level links)
 * Used in Header component for clean, minimal navigation
 */
export const NAV_ITEMS: INavItem[] = [
    { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
    { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
    { id: 'practice-areas', label: 'Practice Areas', href: '', hasSubmenu: true },
    { id: 'facilitation', label: 'Services', href: '', hasSubmenu: true },
    { id: 'blogs', label: 'Blogs', href: '/blogs', hasSubmenu: false },
    { id: 'about', label: 'About Us', href: '/#about', hasSubmenu: false },
]

/**
 * Extended navigation items for SidePanel and Footer
 * Includes additional pages (About Us, Case Studies, Blog)
 */
export const SIDEPANEL_FOOTER_NAV_ITEMS: INavItem[] = [
    { id: 'home', label: 'Home', href: '/', hasSubmenu: false },
    { id: 'team', label: 'Our Team', href: '/team', hasSubmenu: false },
    { id: 'about', label: 'About Us', href: '/#about', hasSubmenu: false },
    { id: 'blogs', label: 'Blogs', href: '/blogs', hasSubmenu: false },
    { id: 'practice-areas', label: 'Practice Areas', href: '', hasSubmenu: true },
    { id: 'facilitation', label: 'Services', href: '', hasSubmenu: true },
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
 * Services navigation section data
 */
export const FACILITATION_DATA: INavSection = {
    title: 'Services',
    description: 'Legal facilitation & regulatory services',
    categories: [
        {
            title: 'Business & Corporate',
            links: ['ntn-registration', 'strn-registration', 'secp-registration', 'agreement-drafting', 'import-export-license', 'chamber-registration']
                .map(id => svcLink('facilitation', id, facilitationServices)),
        },
        {
            title: 'Compliance & Licensing',
            links: ['pfa-license', 'drap-licensing', 'ihra-registration', 'ip-registration', 'tv-channel-registration', 'restaurant-license']
                .map(id => svcLink('facilitation', id, facilitationServices)),
        },
        {
            title: 'Real Estate & Property',
            links: ['property-transfer', 'tax-filing']
                .map(id => svcLink('facilitation', id, facilitationServices)),
        },
        {
            title: 'Personal Certificates',
            links: ['succession-certificate', 'family-registration', 'child-registration']
                .map(id => svcLink('facilitation', id, facilitationServices)),
        },
        {
            title: "Women's Legal Desk",
            highlight: true,
            links: ['harassment-cases', 'family-law', 'inheritance-succession']
                .map(id => svcLink('women-desk', id, womenDeskServices)),
        },
        {
            title: 'Overseas Pakistanis',
            highlight: true,
            links: ['property-verification', 'property-transaction', 'property-disputes', 'power-of-attorney', 'family-law', 'inheritance-succession', 'civil-litigation']
                .map(id => svcLink('overseas', id, overseasServices)),
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
        title: 'Services',
        categories: FACILITATION_DATA.categories,
    },
}
