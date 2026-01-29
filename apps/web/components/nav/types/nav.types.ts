/**
 * Navigation TypeScript Interfaces
 *
 * Centralized type definitions for all navigation components.
 * Follows IName convention per Component Architect guidelines.
 */

/**
 * Single navigation link item
 */
export interface INavLink {
    /** Unique identifier for the link */
    id?: string
    /** Display text for the link */
    label: string
    /** URL destination */
    href: string
}

/**
 * Main navigation item (top-level nav)
 */
export interface INavItem extends INavLink {
    /** Unique identifier */
    id: string
    /** Whether this item has a submenu/dropdown */
    hasSubmenu?: boolean
}

/**
 * Category containing multiple links (for mega menus)
 */
export interface INavCategory {
    /** Category title */
    title: string
    /** Whether this category should be visually highlighted */
    highlight?: boolean
    /** Links within this category */
    links: INavLink[]
}

/**
 * Full navigation section (for dropdowns/panels)
 */
export interface INavSection {
    /** Section title */
    title: string
    /** Section description */
    description: string
    /** Categories within this section */
    categories: INavCategory[]
}

/**
 * Props for NavLink component
 */
export interface INavLinkProps {
    /** URL destination */
    href: string
    /** Link text content */
    children: string
    /** Optional click handler */
    onClick?: () => void
    /** Optional additional CSS class */
    className?: string
    /** Whether to apply slot machine animation */
    animated?: boolean
}

/**
 * Props for NavButton component
 */
export interface INavButtonProps {
    /** URL destination */
    href: string
    /** Button text content */
    children: string
    /** Optional click handler */
    onClick?: () => void
    /** Optional additional CSS class */
    className?: string
    /** Whether to show arrow icon */
    showArrow?: boolean
    /** Arrow style: 'diagonal' or 'horizontal' */
    arrowStyle?: 'diagonal' | 'horizontal'
    /** Whether to apply slot machine animation to text */
    animated?: boolean
}
