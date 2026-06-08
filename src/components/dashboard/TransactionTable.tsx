import { Transaction } from "@prisma/client"
import { formatGHS } from "@/lib/calculations"
import { format } from "date-fns"
import Link from "next/link"

interface Props {
  transactions: Transaction[]
  startingFloat: number
  showAddButton?: boolean
}

export default function TransactionTable({ transactions, startingFloat, showAddButton = true }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No transactions today</p>
        <p className="text-gray-400 text-sm mb-6">Start recording your cash-in and cash-out transactions.</p>
        {showAddButton && (
          <Link href="/add-transaction" className="btn-primary inline-block">
            Record first transaction
          </Link>
        )}
      </div>
    )
  }

  let runningBalance = startingFloat

  const rows = transactions.map((t) => {
    if (t.type === "CASH_IN") {
      runningBalance += t.amount
    } else {
      runningBalance -= t.amount
    }
    return { ...t, runningBalance }
  })

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Transaction Log</h3>
        {showAddButton && (
          <Link href="/add-transaction" className="btn-primary text-sm py-1.5 px-3">
            + Add
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Time</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Commission</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Phone</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  {format(new Date(t.createdAt), "HH:mm")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
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
                <td className="px-6 py-4 text-right font-medium text-gray-700">
                  {formatGHS(t.runningBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
