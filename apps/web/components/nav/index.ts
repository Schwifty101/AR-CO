/**
 * Nav Component Exports
 *
 * Clean public API for all navigation components.
 * Import from '@/components/nav' instead of individual files.
 *
 * @example
 * ```tsx
 * import { Navigation, LogoSection, NavButton } from '@/components/nav'
 * ```
 */

// Main navigation component (new simplified implementation)
export { default as Navigation } from './Navigation'

// Legacy components (deprecated - will be removed in future)
// Header, SidePanel, FullScreenDropdown, MobileFullScreenMenu, LogoSection removed

// Shared components
// NavLink, NavButton removed

// Animations (re-exported from shared)
export { default as SlotMachineText } from '../shared/animations/SlotMachineText'

// Types
export type {
    INavItem,
    INavLink,
    INavCategory,
    INavSection,
    INavLinkProps,
    INavButtonProps,
} from './types/nav.types'

// Data
export { NAV_ITEMS, SIDEPANEL_FOOTER_NAV_ITEMS, NAV_SECTIONS, PRACTICE_AREAS_DATA, FACILITATION_DATA, SUBMENU_DATA } from '../data/navData'
