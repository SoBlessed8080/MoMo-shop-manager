import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatGHS } from "@/lib/calculations"
import { format } from "date-fns"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { date?: string; type?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const userId = session.user.id
  const filterDate = searchParams.date
  const filterType = searchParams.type

  const where: Parameters<typeof prisma.transaction.findMany>[0]["where"] = { userId }

  if (filterDate) {
    const start = new Date(filterDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(filterDate)
    end.setHours(23, 59, 59, 999)
    where.createdAt = { gte: start, lte: end }
  }

  if (filterType === "CASH_IN" || filterType === "CASH_OUT") {
    where.type = filterType
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const totalCashIn = transactions.filter((t) => t.type === "CASH_IN").reduce((s, t) => s + t.amount, 0)
  const totalCashOut = transactions.filter((t) => t.type === "CASH_OUT").reduce((s, t) => s + t.amount, 0)
  const totalCommission = transactions.reduce((s, t) => s + t.commission, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500 text-sm mt-1">{transactions.length} records shown</p>
        </div>
        <Link href="/add-transaction" className="btn-primary text-sm">
          + Add
        </Link>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-input w-auto"
              defaultValue={filterDate ?? ""}
            />
          </div>
          <div>
            <label className="form-label">Type</label>
            <select name="type" className="form-input w-auto" defaultValue={filterType ?? ""}>
              <option value="">All types</option>
              <option value="CASH_IN">Cash-In</option>
              <option value="CASH_OUT">Cash-Out</option>
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm py-2">
            Filter
          </button>
          <Link href="/transactions" className="btn-secondary text-sm py-2">
            Clear
          </Link>
        </form>
      </div>

      {/* Totals bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Total Cash-In</p>
          <p className="text-lg font-bold text-green-600">{formatGHS(totalCashIn)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Total Cash-Out</p>
          <p className="text-lg font-bold text-red-600">{formatGHS(totalCashOut)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-500 mb-1">Total Commission</p>
          <p className="text-lg font-bold text-blue-600">{formatGHS(totalCommission)}</p>
        </div>
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">No transactions found for the selected filters.</p>
          <Link href="/add-transaction" className="btn-primary inline-block">
            Record a transaction
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Commission</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {format(new Date(t.createdAt), "dd MMM yy, HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.type === "CASH_IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.type === "CASH_IN" ? "↑ Cash-In" : "↓ Cash-Out"}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${t.type === "CASH_IN" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "CASH_IN" ? "+" : "-"}{formatGHS(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 hidden sm:table-cell">
                      {t.commission > 0 ? formatGHS(t.commission) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {t.phoneNumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">
                      {t.note || "-"}
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
