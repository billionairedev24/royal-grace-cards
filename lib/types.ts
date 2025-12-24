export interface Card {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  images: string[]
  category: string
  inStock: boolean
  inventory: number
}

export interface CartItem {
  cardId: string
  name: string
  price: number
  quantity: number
}

export interface Config {
  freeShippingThreshold: number
  standardShippingFee: number
  stripeEnabled: boolean
  zelleEnabled: boolean
  cashappEnabled: boolean
  zelleEmail: string
  zellePhone: string
  cashappHandle: string
  storeName?: string
}

export interface OrderItem {
  id: string
  card: Card
  quantity: number
  priceAtPurchase: number
}

export interface TrackingUpdate {
  id?: string
  status: string
  timestamp: string
  message: string
}

export interface Order {
  id: string
  items: OrderItem[]
  customerName: string
  customerEmail: string
  customerPhone: string
  cartSessionId?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  subtotal: number
  shippingFee: number
  total: number
  paymentMethod: "STRIPE" | "ZELLE" | "CASHAPP"
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED"
  fulfillmentStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED"
  trackingCode?: string
  shippingNotes?: string
  trackingUpdates?: TrackingUpdate[]
  createdAt: string
  updatedAt: string
}

export interface CheckoutResponse {
  checkoutUrl?: string
  sessionId?: string
  success: boolean
  message?: string
}
