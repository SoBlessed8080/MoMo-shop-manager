import { Transaction, DailySetting, UserSettings } from "@prisma/client"

export type { Transaction, DailySetting, UserSettings }

export type TransactionType = "CASH_IN" | "CASH_OUT"

export interface TransactionWithBalance extends Transaction {
  runningBalance?: number
}

export interface DashboardData {
  startingFloat: number
  actualCash: number | null
  totalCashIn: number
  totalCashOut: number
  expectedCash: number
  discrepancy: number | null
  totalProfit: number
  transactions: TransactionWithBalance[]
  shopName: string
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }
}
