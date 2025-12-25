"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Settings, LogOut, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {getApiBaseUrl} from "@/lib/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkSession()
  }, [pathname])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/admin/me")
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = `${getApiBaseUrl()}/login`
          return
        }
        throw new Error("Failed to check session")
      }
      setChecking(false)
    } catch (error) {
      console.error("Session check error:", error)
      window.location.href = `${getApiBaseUrl()}/login`
    }
  }

  const handleLogout = async () => {
    try {
      // First redirect to backend logout which will clear session and cookie
      window.location.href = `${getApiBaseUrl()}/logout?logout`
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-bold">RG</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Royal Grace Cards</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-64 border-r bg-card min-h-[calc(100vh-73px)]">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <Link key={item.name} href={item.href} className="block">
                  <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card">
        <div className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full flex-col h-auto py-2 gap-1"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
