export interface DailySummary {
  startingFloat: number
  totalCashIn: number
  totalCashOut: number
  expectedCash: number
  actualCash: number | null
  discrepancy: number | null
  totalProfit: number
  transactionCount: number
}

export function calculateDailySummary(
  transactions: { type: string; amount: number; commission: number }[],
  startingFloat: number,
  actualCash: number | null
): DailySummary {
  const totalCashIn = transactions
    .filter((t) => t.type === "CASH_IN")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCashOut = transactions
    .filter((t) => t.type === "CASH_OUT")
    .reduce((sum, t) => sum + t.amount, 0)

  const expectedCash = startingFloat + totalCashIn - totalCashOut

  const totalProfit = transactions.reduce((sum, t) => sum + t.commission, 0)

  const discrepancy = actualCash !== null ? actualCash - expectedCash : null

  return {
    startingFloat,
    totalCashIn,
    totalCashOut,
    expectedCash,
    actualCash,
    discrepancy,
    totalProfit,
    transactionCount: transactions.length,
  }
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getDiscrepancyStatus(discrepancy: number | null): "balanced" | "missing" | "excess" | "pending" {
  if (discrepancy === null) return "pending"
  if (Math.abs(discrepancy) < 0.01) return "balanced"
  if (discrepancy < 0) return "missing"
  return "excess"
}

export function getTodayRange(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getDateOnly(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}
