"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Config } from "@/lib/types"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, isLoading, error, fetchCart } = useCartStore()
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customer/config`, {
          credentials: "include",
        })
        const configData: Config = await response.json()
        setConfig(configData)
      } catch (error) {
        console.error("Failed to fetch config:", error)
      }
    }

    fetchConfig()
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const shippingFee = config && subtotal >= config.freeShippingThreshold ? 0 : config?.standardShippingFee || 0
  const total = subtotal + shippingFee

  if (error && !error.includes("NEXT_PUBLIC_BACKEND_URL")) {
    return (
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </header>

          <div className="container mx-auto px-4 py-16">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>Unable to connect to the backend server. Please check:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Your Java backend is running</li>
                  <li>The backend URL is correct in environment variables</li>
                  <li>CORS is properly configured on the backend</li>
                </ul>
                <Button variant="outline" onClick={() => fetchCart()} className="gap-2 mt-4">
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
    )
  }

  if (items.length === 0) {
    return (
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </header>

          <div className="container mx-auto px-4 py-16 text-center">
            <div className="mx-auto max-w-md">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any cards yet. Start shopping to fill your cart!
              </p>
              <Link href="/">
                <Button size="lg" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                  <Card key={item.cardId} className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src="/placeholder.svg" alt={item.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-balance mb-1">{item.name}</h3>
                        <p className="text-sm text-muted-foreground text-pretty mb-3 line-clamp-2">Premium greeting card</p>
                        <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.cardId)}
                            className="text-destructive hover:text-destructive"
                            disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2 border rounded-lg">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.cardId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.cardId, item.quantity + 1)}
                              disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                    {shippingFee === 0 ? (
                        <span className="text-accent font-medium">FREE</span>
                    ) : (
                        `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                  </div>
                  {config && subtotal < config.freeShippingThreshold && (
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        Add ${(config.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!
                      </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <Button size="lg" className="w-full" onClick={() => router.push("/checkout")}>
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
