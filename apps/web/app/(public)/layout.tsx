"use client"

import SmoothScroll from "@/components/SmoothScroll"
import Header from "@/components/nav/Header"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            <SmoothScroll>
                {children}
            </SmoothScroll>
        </>
    )
}
