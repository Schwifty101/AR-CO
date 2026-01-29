'use client'

import Link from 'next/link'
import SlotMachineText from '../../shared/animations/SlotMachineText'
import type { INavLinkProps } from '../types/nav.types'
import styles from './NavLink.module.css'

/**
 * NavLink Component
 *
 * Reusable navigation link with optional SlotMachineText animation.
 * Used across Header, SidePanel, and MobileFullScreenMenu for consistency.
 *
 * @example
 * ```tsx
 * <NavLink href="/" animated>Home</NavLink>
 * <NavLink href="/team">Our Team</NavLink>
 * ```
 */
export default function NavLink({
    href,
    children,
    onClick,
    className = '',
    animated = true,
}: INavLinkProps) {
    return (
        <Link
            href={href}
            className={`${styles.navLink} ${className}`}
            onClick={onClick}
        >
            {animated ? (
                <SlotMachineText>{children}</SlotMachineText>
            ) : (
                <span>{children}</span>
            )}
        </Link>
    )
}
