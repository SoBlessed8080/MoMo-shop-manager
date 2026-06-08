import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateDailySummary, formatGHS, getDiscrepancyStatus, getTodayRange, getDateOnly } from "@/lib/calculations"
import { format } from "date-fns"
import EndOfDayForm from "./EndOfDayForm"
import DiscrepancyAlert from "@/components/dashboard/DiscrepancyAlert"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function EndOfDayPage() {
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
  const discStatus = getDiscrepancyStatus(summary.discrepancy)
  const today = format(new Date(), "EEEE, d MMMM yyyy")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">End of Day Summary</h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      {/* Discrepancy alert — hero element on this page */}
      <DiscrepancyAlert
        expectedCash={summary.expectedCash}
        actualCash={summary.actualCash}
        discrepancy={summary.discrepancy}
      />

      {/* Daily totals */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Day Summary</h2>
        <div className="space-y-3">
          {[
            { label: "Starting Float", value: formatGHS(summary.startingFloat), color: "text-gray-700" },
            { label: "Total Cash-In", value: `+ ${formatGHS(summary.totalCashIn)}`, color: "text-green-600" },
            { label: "Total Cash-Out", value: `- ${formatGHS(summary.totalCashOut)}`, color: "text-red-600" },
            { label: "Expected Cash Balance", value: formatGHS(summary.expectedCash), color: "text-blue-700", bold: true },
            { label: "Total Commission (Profit)", value: formatGHS(summary.totalProfit), color: "text-green-700", bold: true },
          ].map((row) => (
            <div key={row.label} className={`flex justify-between items-center py-2 ${row.bold ? "border-t border-gray-200 font-semibold" : ""}`}>
              <span className="text-sm text-gray-600">{row.label}</span>
              <span className={`text-sm ${row.color} ${row.bold ? "font-bold" : ""}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {summary.actualCash !== null && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Actual Cash (counted)</span>
              <span className="text-sm font-bold text-gray-900">{formatGHS(summary.actualCash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Discrepancy</span>
              <span
                className={`text-sm font-bold ${
                  discStatus === "balanced"
                    ? "text-green-600"
                    : discStatus === "missing"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {discStatus === "balanced"
                  ? "GH₵ 0.00"
                  : discStatus === "missing"
                  ? `- ${formatGHS(Math.abs(summary.discrepancy!))}`
                  : `+ ${formatGHS(Math.abs(summary.discrepancy!))}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Configure starting float & actual cash form */}
      <EndOfDayForm
        defaultStartingFloat={startingFloat}
        currentActualCash={dailySetting?.actualCash ?? null}
        currentNotes={dailySetting?.notes ?? ""}
        transactionCount={transactions.length}
        expectedCash={summary.expectedCash}
      />

      {/* Transaction list */}
      {transactions.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              Today&apos;s Transactions ({transactions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Time</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Type</th>
                  <th className="text-right px-6 py-3 text-xs text-gray-500 uppercase">Amount</th>
                  <th className="text-right px-6 py-3 text-xs text-gray-500 uppercase hidden sm:table-cell">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 text-gray-500 text-xs">{format(new Date(t.createdAt), "HH:mm")}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.type === "CASH_IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {t.type === "CASH_IN" ? "↑ In" : "↓ Out"}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right font-medium text-xs ${t.type === "CASH_IN" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "CASH_IN" ? "+" : "-"}{formatGHS(t.amount)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-400 text-xs hidden sm:table-cell">
                      {t.commission > 0 ? formatGHS(t.commission) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
