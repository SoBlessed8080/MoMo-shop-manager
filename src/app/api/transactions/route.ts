import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getTodayRange } from "@/lib/calculations"

const VALID_TYPES = ["CASH_IN", "CASH_OUT"]

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get("date")
  const limitParam = searchParams.get("limit")

  let start: Date, end: Date

  if (dateParam) {
    start = new Date(dateParam)
    start.setHours(0, 0, 0, 0)
    end = new Date(dateParam)
    end.setHours(23, 59, 59, 999)
  } else {
    const range = getTodayRange()
    start = range.start
    end = range.end
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: start, lte: end },
    },
    orderBy: { createdAt: "asc" },
    take: limitParam ? parseInt(limitParam) : undefined,
  })

  return NextResponse.json({ transactions })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { type, amount, commission, phoneNumber, note } = await request.json()

    if (!type || !amount) {
      return NextResponse.json({ error: "Type and amount are required" }, { status: 400 })
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        amount: parseFloat(amount),
        commission: parseFloat(commission ?? 0),
        phoneNumber: phoneNumber?.trim() || null,
        note: note?.trim() || null,
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
