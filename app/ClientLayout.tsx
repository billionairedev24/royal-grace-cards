"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import { usePathname } from "next/navigation"
import { CartProvider } from "@/lib/cart-provider"

export function ClientLayout({
                               children,
                             }: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const showNavbar = !pathname.startsWith("/admin")

  return (
      <CartProvider>
        {showNavbar && <Navbar />}
        {children}
        <Analytics />
      </CartProvider>
  )
}
