"use client"

import type React from "react"

import { useEffect } from "react"
import { useCartStore } from "./cart-store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function CartProvider({ children }: { children: React.ReactNode }) {
    const fetchCart = useCartStore((state) => state.fetchCart)
    const isInitialized = useCartStore((state) => state.isInitialized)
    const error = useCartStore((state) => state.error)

    useEffect(() => {
        if (!isInitialized) {
            fetchCart()
        }
    }, [fetchCart, isInitialized])

    if (error && error.includes("NEXT_PUBLIC_BACKEND_URL")) {
        return (
            <div className="min-h-screen bg-background p-4">
                <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Backend Configuration Required</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>The backend URL is not configured. Please follow these steps:</p>
                        <ol className="list-decimal ml-5 space-y-1">
                            <li>
                                Click on <strong>Vars</strong> in the sidebar
                            </li>
                            <li>
                                Add <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_BACKEND_URL</code>
                            </li>
                            <li>Set the value to your Java backend URL (e.g., http://localhost:8080)</li>
                            <li>Refresh the page</li>
                        </ol>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return <>{children}</>
}
