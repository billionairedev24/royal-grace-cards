"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, MapPin, CreditCard, Mail, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Order } from "@/lib/types"

// Helper function to mask email addresses for privacy
function maskEmail(email: string): string {
    const [username, domain] = email.split("@")
    if (username.length <= 3) return `${username[0]}***@${domain}`
    return `${username.substring(0, 2)}${"*".repeat(username.length - 2)}@${domain}`
}

// Helper function to mask phone numbers for privacy
function maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length < 4) return "***"
    return `(***) ***-${cleaned.slice(-4)}`
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (sessionId) {
            fetchOrderBySessionId(sessionId)
        } else {
            setError("No payment session ID found")
            setLoading(false)
        }
    }, [sessionId])

    const fetchOrderBySessionId = async (paymentSessionId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/session/${paymentSessionId}`, {
                credentials: "include",
            })

            if (response.ok) {
                const data = await response.json()
                setOrder(data)
            } else {
                setError("Failed to retrieve order details")
            }
        } catch (error) {
            console.error("Failed to fetch order:", error)
            setError("An error occurred while fetching order details")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your order details...</p>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <Mail className="h-12 w-12 text-red-500" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-4">Unable to Load Order</h1>
                            <p className="text-lg text-muted-foreground mb-8">{error || "Order not found"}</p>
                            <Link href="/">
                                <Button size="lg">Return to Home</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Payment Successful!</h1>
                        <p className="text-lg text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Grid layout for order summary and details */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* Left Column: Order Items */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6">
                                <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b last:pb-0 last:border-0">
                                            <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                                <Image
                                                    src={item.card.imageUrl || "/placeholder.svg"}
                                                    alt={item.card.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-semibold text-foreground mb-1 truncate">{item.card.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.card.description}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                                                    <span className="font-medium">${item.priceAtPurchase.toFixed(2)} each</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-foreground">
                                                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Shipping Address */}
                            <Card className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-foreground mb-2">Shipping Address</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {order.customerName}
                                            <br />
                                            {order.shippingAddress.street}
                                            <br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Contact Information */}
                            <Card className="p-6">
                                <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{maskEmail(order.customerEmail)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{maskPhone(order.customerPhone)}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Order Summary & Status */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card className="p-6">
                                <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium">${order.shippingFee.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-base">
                                        <span className="font-semibold text-foreground">Total</span>
                                        <span className="font-bold text-primary text-lg">${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Payment & Status */}
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                            <p className="font-medium text-foreground">
                                                {order.paymentMethod === "STRIPE" && "Credit Card"}
                                                {order.paymentMethod === "ZELLE" && "Zelle"}
                                                {order.paymentMethod === "CASHAPP" && "Cash App"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Payment Status</span>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                        {order.paymentStatus.toLowerCase()}
                      </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Fulfillment Status</span>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {order.fulfillmentStatus.toLowerCase()}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Tracking Information */}
                            {order.trackingCode ? (
                                <Card className="p-6">
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-primary mt-1" />
                                        <div className="flex-grow">
                                            <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                                            <code className="text-sm font-mono font-semibold text-foreground break-all">
                                                {order.trackingCode}
                                            </code>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-blue-500 mt-1" />
                                        <div>
                                            <p className="font-medium text-foreground mb-1">Processing Order</p>
                                            <p className="text-sm text-muted-foreground">
                                                Tracking information will be available once your order ships.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link href={`/order-tracking?orderId=${order.id}`} className="block">
                                    <Button className="w-full" size="lg">
                                        Track Your Order
                                    </Button>
                                </Link>
                                <Link href="/" className="block">
                                    <Button className="w-full bg-transparent" variant="outline" size="lg">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>

                            <p className="text-xs text-center text-muted-foreground px-2">
                                A confirmation email has been sent to your email address.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    )
}
