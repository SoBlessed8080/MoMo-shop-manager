import { formatGHS, getDiscrepancyStatus } from "@/lib/calculations"

interface Props {
  startingFloat: number
  totalCashIn: number
  totalCashOut: number
  expectedCash: number
  actualCash: number | null
  discrepancy: number | null
  totalProfit: number
  transactionCount: number
}

function StatCard({
  label,
  value,
  sub,
  variant = "default",
}: {
  label: string
  value: string
  sub?: string
  variant?: "default" | "green" | "red" | "blue" | "yellow"
}) {
  const colorMap = {
    default: "text-gray-900",
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
  }

  return (
    <div className="stat-card">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[variant]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function SummaryCards({
  startingFloat,
  totalCashIn,
  totalCashOut,
  expectedCash,
  actualCash,
  discrepancy,
  totalProfit,
  transactionCount,
}: Props) {
  const discStatus = getDiscrepancyStatus(discrepancy)

  const diffVariant =
    discStatus === "balanced" ? "green" : discStatus === "missing" ? "red" : discStatus === "excess" ? "yellow" : "default"

  const diffLabel =
    discrepancy === null
      ? "Not entered"
      : discStatus === "balanced"
      ? formatGHS(0)
      : discStatus === "missing"
      ? `- ${formatGHS(Math.abs(discrepancy))}`
      : `+ ${formatGHS(Math.abs(discrepancy!))}`

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Expected Cash"
        value={formatGHS(expectedCash)}
        sub={`Float: ${formatGHS(startingFloat)}`}
        variant="blue"
      />
      <StatCard
        label="Actual Cash"
        value={actualCash !== null ? formatGHS(actualCash) : "Not entered"}
        sub="Physical count"
        variant={actualCash !== null ? "default" : "default"}
      />
      <StatCard
        label="Difference"
        value={diffLabel}
        sub={discrepancy === null ? "Enter end-of-day count" : discStatus === "balanced" ? "Balanced" : discStatus === "missing" ? "Missing" : "Surplus"}
        variant={diffVariant}
      />
      <StatCard
        label="Today's Profit"
        value={formatGHS(totalProfit)}
        sub={`${transactionCount} transactions`}
        variant="green"
      />

      <StatCard label="Total Cash-In" value={formatGHS(totalCashIn)} variant="green" />
      <StatCard label="Total Cash-Out" value={formatGHS(totalCashOut)} variant="red" />
      <StatCard label="Starting Float" value={formatGHS(startingFloat)} variant="blue" />
      <StatCard label="Net Cash Flow" value={formatGHS(totalCashIn - totalCashOut)} variant={totalCashIn - totalCashOut >= 0 ? "green" : "red"} />
    </div>
  )
}
