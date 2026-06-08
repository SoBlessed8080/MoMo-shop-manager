import { formatGHS, getDiscrepancyStatus } from "@/lib/calculations"

interface Props {
  expectedCash: number
  actualCash: number | null
  discrepancy: number | null
}

export default function DiscrepancyAlert({ expectedCash, actualCash, discrepancy }: Props) {
  const status = getDiscrepancyStatus(discrepancy)

  if (status === "pending") {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 flex items-start gap-4">
        <span className="text-2xl">⏳</span>
        <div>
          <p className="font-semibold text-yellow-800 text-base">End-of-day count pending</p>
          <p className="text-yellow-700 text-sm mt-1">
            Go to <strong>End of Day</strong> to enter your physical cash count and check for discrepancies.
          </p>
          <p className="text-yellow-600 text-sm mt-2">
            Expected cash: <strong>{formatGHS(expectedCash)}</strong>
          </p>
        </div>
      </div>
    )
  }

  if (status === "balanced") {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 flex items-start gap-4">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-green-800 text-base">All balances match. No discrepancies found.</p>
          <p className="text-green-700 text-sm mt-1">
            Expected {formatGHS(expectedCash)} — Actual {formatGHS(actualCash!)} — Difference{" "}
            <strong>GH₵ 0.00</strong>
          </p>
        </div>
      </div>
    )
  }

  if (status === "missing") {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 flex items-start gap-4">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-semibold text-red-800 text-base text-lg">
            Cash mismatch detected: {formatGHS(Math.abs(discrepancy!))} missing or unaccounted for
          </p>
          <p className="text-red-700 text-sm mt-2">
            Expected: <strong>{formatGHS(expectedCash)}</strong> &nbsp;|&nbsp; Actual:{" "}
            <strong>{formatGHS(actualCash!)}</strong> &nbsp;|&nbsp; Missing:{" "}
            <strong>{formatGHS(Math.abs(discrepancy!))}</strong>
          </p>
          <p className="text-red-600 text-xs mt-2">
            Review your transaction log below to identify the source of the discrepancy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 flex items-start gap-4">
      <span className="text-2xl">📈</span>
      <div>
        <p className="font-semibold text-yellow-800 text-base">
          Cash surplus detected: {formatGHS(Math.abs(discrepancy!))} extra
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          Expected: <strong>{formatGHS(expectedCash)}</strong> — Actual:{" "}
          <strong>{formatGHS(actualCash!)}</strong> — Extra:{" "}
          <strong>+{formatGHS(Math.abs(discrepancy!))}</strong>
        </p>
        <p className="text-yellow-600 text-xs mt-1">
          This could be from unrecorded commissions collected in cash.
        </p>
      </div>
    </div>
  )
}
