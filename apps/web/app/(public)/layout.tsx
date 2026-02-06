"use client"

import SmoothScroll from "@/components/SmoothScroll"
import ScrollRestoration from "@/components/ScrollRestoration"
import Navigation from "@/components/nav/Navigation"
import Footer from "@/components/footer/Footer"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navigation />
            <SmoothScroll>
                <ScrollRestoration />
                {children}
                <Footer />
            </SmoothScroll>
        </>
    )
}
