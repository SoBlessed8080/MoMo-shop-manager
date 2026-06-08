import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { shopName, defaultStartingFloat, commissionRate } = await request.json()

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(shopName && { shopName }),
        ...(defaultStartingFloat !== undefined && { defaultStartingFloat: parseFloat(defaultStartingFloat) }),
        ...(commissionRate !== undefined && { commissionRate: parseFloat(commissionRate) }),
      },
      create: {
        userId: session.user.id,
        shopName: shopName ?? "My MoMo Shop",
        defaultStartingFloat: parseFloat(defaultStartingFloat ?? 500),
        commissionRate: parseFloat(commissionRate ?? 0.01),
      },
    })

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
