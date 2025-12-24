"use client"

import type React from "react"
import type { Config, CheckoutResponse } from "@/lib/types"

import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<Config | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    state: "TX",
    zipCode: "",
    paymentMethod: "STRIPE" as "STRIPE" | "ZELLE" | "CASHAPP",
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Full name is required"
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = "Name must be at least 2 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required"
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }

    const phoneRegex = /^[\d\s()+-]{10,}$/
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required"
    } else if (!phoneRegex.test(formData.customerPhone.replace(/\D/g, ""))) {
      newErrors.customerPhone = "Please enter a valid phone number"
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    } else if (formData.state.trim().length !== 2) {
      newErrors.state = "State must be 2 characters (e.g., TX)"
    }

    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code (e.g., 78701)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        items: items.map((item) => ({
          cardId: item.cardId,
          quantity: item.quantity,
        })),
        shippingFee: shippingFee,
        paymentMethod: formData.paymentMethod,
      }

      console.log("[v0] Sending order data:", JSON.stringify(orderData, null, 2))

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json" ,
          "X-UI-BASE-URL": window.location.origin
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to process checkout")
      }

      const checkoutResponse: CheckoutResponse = await response.json()

      console.log("[v0] Checkout response:", checkoutResponse)

      if (!checkoutResponse.success) {
        throw new Error(checkoutResponse.message || "Checkout failed")
      }

      await clearCart()

      if (formData.paymentMethod === "STRIPE" && checkoutResponse.checkoutUrl) {
        toast({
          title: "Redirecting to Stripe...",
          description: "You will be redirected to complete your payment.",
        })
        window.location.href = checkoutResponse.checkoutUrl
      } else {
        toast({
          title: "Order Created",
          description: checkoutResponse.message || "Please complete payment using the QR code.",
        })
        router.push(`/payment/qr-code?method=${formData.paymentMethod.toLowerCase()}`)
      }
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/cart">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Contact Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          required
                          placeholder="John Smith"
                          className={errors.customerName ? "border-destructive" : ""}
                      />
                      {errors.customerName && <p className="text-sm text-destructive mt-1">{errors.customerName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          required
                          placeholder="john@example.com"
                          className={errors.customerEmail ? "border-destructive" : ""}
                      />
                      {errors.customerEmail && <p className="text-sm text-destructive mt-1">{errors.customerEmail}</p>}
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone *</Label>
                      <Input
                          id="customerPhone"
                          name="customerPhone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          required
                          placeholder="(555) 123-4567"
                          className={errors.customerPhone ? "border-destructive" : ""}
                      />
                      {errors.customerPhone && <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>}
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Shipping Address</h2>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                          id="street"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          required
                          placeholder="123 Main St"
                          className={errors.street ? "border-destructive" : ""}
                      />
                      {errors.street && <p className="text-sm text-destructive mt-1">{errors.street}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            placeholder="Austin"
                            className={errors.city ? "border-destructive" : ""}
                        />
                        {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            placeholder="TX"
                            maxLength={2}
                            className={errors.state ? "border-destructive" : ""}
                        />
                        {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            placeholder="78701"
                            className={errors.zipCode ? "border-destructive" : ""}
                        />
                        {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Payment Method</h2>
                  <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value as any }))}
                      className="space-y-3"
                  >
                    {config?.stripeEnabled && (
                        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="STRIPE" id="stripe" />
                          <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Credit/Debit Card</div>
                              <div className="text-sm text-muted-foreground">Pay securely with Stripe</div>
                            </div>
                          </Label>
                        </div>
                    )}
                    {config?.zelleEnabled && (
                        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="ZELLE" id="zelle" />
                          <Label htmlFor="zelle" className="flex items-center gap-2 cursor-pointer flex-1">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Zelle</div>
                              <div className="text-sm text-muted-foreground">Pay with Zelle QR code</div>
                            </div>
                          </Label>
                        </div>
                    )}
                    {config?.cashappEnabled && (
                        <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="CASHAPP" id="cashapp" />
                          <Label htmlFor="cashapp" className="flex items-center gap-2 cursor-pointer flex-1">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Cash App</div>
                              <div className="text-sm text-muted-foreground">Pay with Cash App QR code</div>
                            </div>
                          </Label>
                        </div>
                    )}
                  </RadioGroup>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="p-4 sm:p-6 lg:sticky lg:top-4">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                        <div key={item.cardId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal</span>
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
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
  )
}
