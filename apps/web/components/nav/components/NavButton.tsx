'use client'

import Link from 'next/link'
import SlotMachineText from '../../shared/animations/SlotMachineText'
import type { INavButtonProps } from '../types/nav.types'
import styles from './NavButton.module.css'

/**
 * NavButton Component
 *
 * Unified CTA button component with consistent styling across all nav contexts.
 * Matches "Book Consultation" / "Schedule a Call" design pattern.
 *
 * @example
 * ```tsx
 * <NavButton href="/contact?consultation=true" showArrow>
 *   Book Consultation
 * </NavButton>
 * <NavButton href="/contact" arrowStyle="diagonal" animated>
 *   Schedule a Call
 * </NavButton>
 * ```
 */
export default function NavButton({
    href,
    children,
    onClick,
    className = '',
    showArrow = true,
    arrowStyle = 'horizontal',
    animated = false,
}: INavButtonProps) {
    return (
        <Link
            href={href}
            className={`${styles.navButton} ${className}`}
            onClick={onClick}
        >
            {animated ? (
                <SlotMachineText>{children}</SlotMachineText>
            ) : (
                <span className={styles.buttonText}>{children}</span>
            )}

            {showArrow && (
                <svg
                    className={styles.arrowIcon}
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                >
                    {arrowStyle === 'diagonal' ? (
                        <path
                            d="M6 14L14 6M14 6H8M14 6V12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <path
                            d="M4 10h12m0 0l-4-4m4 4l-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
            )}
        </Link>
    )
}
