import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDailySummary, getTodayRange, getDateOnly } from "@/lib/calculations"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get("date")

  let dateStart: Date, dateEnd: Date

  if (dateParam) {
    dateStart = new Date(dateParam)
    dateStart.setHours(0, 0, 0, 0)
    dateEnd = new Date(dateParam)
    dateEnd.setHours(23, 59, 59, 999)
  } else {
    const range = getTodayRange()
    dateStart = range.start
    dateEnd = range.end
  }

  const dateOnly = getDateOnly(dateStart)

  const [dailySetting, userSettings, transactions] = await Promise.all([
    prisma.dailySetting.findUnique({
      where: { userId_date: { userId: session.user.id, date: dateOnly } },
    }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const startingFloat = dailySetting?.startingFloat ?? userSettings?.defaultStartingFloat ?? 500
  const summary = calculateDailySummary(transactions, startingFloat, dailySetting?.actualCash ?? null)

  return NextResponse.json({
    summary,
    transactions,
    shopName: userSettings?.shopName ?? "My MoMo Shop",
    hasSetActualCash: dailySetting?.actualCash !== null && dailySetting?.actualCash !== undefined,
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { startingFloat, actualCash, date, notes } = await request.json()

    const targetDate = date ? getDateOnly(new Date(date)) : getDateOnly(new Date())

    const setting = await prisma.dailySetting.upsert({
      where: { userId_date: { userId: session.user.id, date: targetDate } },
      update: {
        ...(startingFloat !== undefined && { startingFloat: parseFloat(startingFloat) }),
        ...(actualCash !== undefined && { actualCash: parseFloat(actualCash) }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId: session.user.id,
        date: targetDate,
        startingFloat: parseFloat(startingFloat ?? 500),
        actualCash: actualCash !== undefined ? parseFloat(actualCash) : null,
        notes,
      },
    })

    return NextResponse.json({ setting })
  } catch {
    return NextResponse.json({ error: "Failed to save daily settings" }, { status: 500 })
  }
}
