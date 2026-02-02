"use client"

import SmoothScroll from "@/components/SmoothScroll"
import Footer from "@/components/footer/Footer"

/**
 * Auth Layout - Wrapper for authentication pages
 *
 * Provides consistent Footer navigation across all auth flows:
 * - Sign in
 * - Sign up
 * - Forgot password
 * - Reset password
 *
 * NOTE: Navigation header is intentionally excluded from auth pages
 * for a cleaner, focused authentication experience.
 *
 * Uses SmoothScroll for consistent scrolling behavior with the rest of the site.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <SmoothScroll>
                {children}
                <Footer />
            </SmoothScroll>
        </>
    )
}
