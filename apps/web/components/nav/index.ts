/**
 * Nav Component Exports
 *
 * Clean public API for all navigation components.
 * Import from '@/components/nav' instead of individual files.
 *
 * @example
 * ```tsx
 * import { Header, SidePanel, NavButton } from '@/components/nav'
 * ```
 */

// Main navigation components
export { default as Header } from './Header'
export { default as SidePanel } from './SidePanel'
export { default as FullScreenDropdown } from './FullScreenDropdown'
export { default as MobileFullScreenMenu } from './MobileFullScreenMenu'
export { default as LogoSection } from './LogoSection'

// Shared components
export { default as NavLink } from './components/NavLink'
export { default as NavButton } from './components/NavButton'

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
export { NAV_ITEMS, NAV_SECTIONS, PRACTICE_AREAS_DATA, FACILITATION_DATA, SUBMENU_DATA } from './data/navData'
