import type { Card, Order, ShippingSettings, PaymentSettings } from "./types"

export const mockCards: Card[] = []

export const defaultShippingSettings: ShippingSettings = {
  freeShippingThreshold: 20,
  standardShippingFee: 5.99,
}

export const defaultPaymentSettings: PaymentSettings = {
  stripeEnabled: true,
  zelleEnabled: true,
  cashappEnabled: true,
  zelleEmail: "payments@royalgracecards.com",
  zellePhone: "(555) 123-4567",
  cashappHandle: "$RoyalGraceCards",
}

// In-memory storage for orders (simulating database)
export const mockOrders: Order[] = []

export const currentShippingSettings = { ...defaultShippingSettings }
export const currentPaymentSettings = { ...defaultPaymentSettings }
