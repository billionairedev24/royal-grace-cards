import { NextResponse } from "next/server"
import type { Config } from "@/lib/types"

interface QRCodeConfig {
  qrCodeUrl: string
  instructions: string
  recipientInfo: {
    email?: string
    phone?: string
    handle?: string
  }
}

// In-memory storage for uploaded QR codes
const uploadedQRCodes: Record<string, string> = {
  zelle: "",
  cashapp: "",
}

async function fetchConfig(): Promise<Config | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customer/config`, {
      credentials: "include",
    })

    if (!response.ok) return null

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch config:", error)
    return null
  }
}

// Mock API: Get QR code for payment method
export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const { searchParams } = new URL(request.url)
  const method = searchParams.get("method") || "zelle"

  const config = await fetchConfig()

  // Use uploaded QR code if available, otherwise use default
  const qrCodeUrl =
      uploadedQRCodes[method] ||
      (method === "zelle"
          ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23fff" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12" font-family="monospace"%3EZelle QR Code%3C/text%3E%3C/svg%3E'
          : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%2300d54b" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12" font-family="monospace" fill="%23fff"%3ECashApp QR%3C/text%3E%3C/svg%3E')

  const qrConfig: QRCodeConfig = {
    qrCodeUrl,
    instructions:
        method === "zelle"
            ? "1. Open your banking app and select Zelle\n2. Scan this QR code or enter the details below\n3. Send the payment for the order amount\n4. Return to confirm payment"
            : "1. Open your Cash App\n2. Tap the Camera icon\n3. Hold up your phone to scan this QR code\n4. Confirm and send payment\n5. Return to confirm payment",
    recipientInfo: {
      email: method === "zelle" ? config?.zelleEmail : undefined,
      phone: method === "zelle" ? config?.zellePhone : undefined,
      handle: method === "cashapp" ? config?.cashappHandle : undefined,
    },
  }

  return NextResponse.json(qrConfig)
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const method = formData.get("method") as string
    const file = formData.get("qrCode") as File

    if (!method || !file) {
      return NextResponse.json({ error: "Missing method or QR code file" }, { status: 400 })
    }

    // Convert file to base64 data URL
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const mimeType = file.type || "image/png"
    const dataUrl = `data:${mimeType};base64,${base64}`

    uploadedQRCodes[method] = dataUrl

    return NextResponse.json({
      success: true,
      message: `QR code for ${method} uploaded successfully`,
      method,
    })
  } catch (error) {
    console.error("Failed to upload QR code:", error)
    return NextResponse.json({ error: "Failed to upload QR code" }, { status: 500 })
  }
}
