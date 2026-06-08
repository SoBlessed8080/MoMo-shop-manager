import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDailySummary, getTodayRange, getDateOnly } from "@/lib/calculations"
import { format } from "date-fns"
import DiscrepancyAlert from "@/components/dashboard/DiscrepancyAlert"
import SummaryCards from "@/components/dashboard/SummaryCards"
import TransactionTable from "@/components/dashboard/TransactionTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const userId = session.user.id
  const { start, end } = getTodayRange()
  const todayDate = getDateOnly(new Date())

  const [dailySetting, userSettings, transactions] = await Promise.all([
    prisma.dailySetting.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const startingFloat = dailySetting?.startingFloat ?? userSettings?.defaultStartingFloat ?? 500
  const summary = calculateDailySummary(transactions, startingFloat, dailySetting?.actualCash ?? null)
  const shopName = userSettings?.shopName ?? "My MoMo Shop"
  const today = format(new Date(), "EEEE, MMMM d, yyyy")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shopName}</h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>
        <Link href="/add-transaction" className="btn-primary text-sm">
          + Transaction
        </Link>
      </div>

      {/* MAIN FEATURE: Discrepancy Alert — most prominent element */}
      <DiscrepancyAlert
        expectedCash={summary.expectedCash}
        actualCash={summary.actualCash}
        discrepancy={summary.discrepancy}
      />

      {/* Summary stat cards */}
      <SummaryCards
        startingFloat={summary.startingFloat}
        totalCashIn={summary.totalCashIn}
        totalCashOut={summary.totalCashOut}
        expectedCash={summary.expectedCash}
        actualCash={summary.actualCash}
        discrepancy={summary.discrepancy}
        totalProfit={summary.totalProfit}
        transactionCount={summary.transactionCount}
      />

      {/* Starting float setup prompt */}
      {!dailySetting && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-blue-800 font-medium text-sm">Set today&apos;s starting float</p>
            <p className="text-blue-600 text-xs mt-0.5">
              Using default: {new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(startingFloat)}
            </p>
          </div>
          <Link href="/end-of-day" className="btn-primary text-sm py-1.5 whitespace-nowrap">
            Configure
          </Link>
        </div>
      )}

      {/* Transaction log */}
      <TransactionTable transactions={transactions} startingFloat={startingFloat} />

      {/* Quick end-of-day CTA */}
      {summary.actualCash === null && transactions.length > 0 && (
        <div className="bg-gray-800 text-white rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Ready to close out for today?</p>
            <p className="text-gray-400 text-sm mt-1">
              Enter your physical cash count to check for discrepancies.
            </p>
          </div>
          <Link href="/end-of-day" className="bg-white text-gray-900 font-medium px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
            End of Day
          </Link>
        </div>
      )}
    </div>
  )
}
