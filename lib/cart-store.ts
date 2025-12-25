"use client"

import { create } from "zustand"
import type { CartItem, Card } from "./types"
import {getApiBaseUrl} from "@/lib/config";

const BACKEND_URL = getApiBaseUrl()

interface CartResponse {
    items: CartItem[]
    totalItems: number
    subtotal: number
}

interface CartStore {
    items: CartItem[]
    isLoading: boolean
    isInitialized: boolean
    error: string | null
    addItem: (card: Card) => Promise<void>
    removeItem: (cardId: string) => Promise<void>
    updateQuantity: (cardId: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    fetchCart: () => Promise<void>
    getTotalItems: () => number
    getSubtotal: () => number
    getItemQuantity: (cardId: string) => number
}

async function fetchAPI(endpoint: string, options?: RequestInit): Promise<Response> {
    if (!BACKEND_URL || BACKEND_URL === "undefined") {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured. Please set it in environment variables.")
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
    }

    return response
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    isLoading: false,
    isInitialized: false,
    error: null,

    fetchCart: async () => {
        try {
            set({ isLoading: true, error: null })
            const response = await fetchAPI("/api/cart")
            const data: CartResponse = await response.json()
            set({ items: data.items, isInitialized: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch cart"
            console.error("Failed to fetch cart:", errorMessage)
            set({ items: [], isInitialized: true, error: errorMessage })
        } finally {
            set({ isLoading: false })
        }
    },

    addItem: async (card) => {
        try {
            set({ isLoading: true, error: null })
            const response = await fetchAPI("/api/cart/items", {
                method: "POST",
                body: JSON.stringify({ cardId: card.id }),
            })
            const data: CartResponse = await response.json()
            set({ items: data.items })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add item"
            console.error("Failed to add item:", errorMessage)
            set({ error: errorMessage })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    removeItem: async (cardId) => {
        try {
            set({ isLoading: true, error: null })
            const response = await fetchAPI(`/api/cart/items/${cardId}`, {
                method: "DELETE",
            })
            const data: CartResponse = await response.json()
            set({ items: data.items })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to remove item"
            console.error("Failed to remove item:", errorMessage)
            set({ error: errorMessage })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateQuantity: async (cardId, quantity) => {
        if (quantity <= 0) {
            await get().removeItem(cardId)
            return
        }

        try {
            set({ isLoading: true, error: null })
            const response = await fetchAPI(`/api/cart/items/${cardId}`, {
                method: "PUT",
                body: JSON.stringify({ quantity }),
            })
            const data: CartResponse = await response.json()
            set({ items: data.items })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update quantity"
            console.error("Failed to update quantity:", errorMessage)
            set({ error: errorMessage })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    clearCart: async () => {
        try {
            set({ isLoading: true, error: null })
            await fetchAPI("/api/cart", {
                method: "DELETE",
            })
            set({ items: [] })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to clear cart"
            console.error("Failed to clear cart:", errorMessage)
            set({ error: errorMessage })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
    },

    getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
    },

    getItemQuantity: (cardId) => {
        const item = get().items.find((item) => item.cardId === cardId)
        return item ? item.quantity : 0
    },
}))
