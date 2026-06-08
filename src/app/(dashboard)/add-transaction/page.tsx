"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type TxType = "CASH_IN" | "CASH_OUT"

export default function AddTransactionPage() {
  const router = useRouter()
  const [type, setType] = useState<TxType>("CASH_IN")
  const [amount, setAmount] = useState("")
  const [commission, setCommission] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    setLoading(true)

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount: amt,
        commission: parseFloat(commission) || 0,
        phoneNumber: phoneNumber || null,
        note: note || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "Failed to add transaction")
      return
    }

    setSuccess(
      `${type === "CASH_IN" ? "Cash-in" : "Cash-out"} of GH₵ ${amt.toFixed(2)} recorded successfully!`
    )
    setAmount("")
    setCommission("")
    setPhoneNumber("")
    setNote("")
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add Transaction</h1>
        <p className="text-gray-500 text-sm mt-1">Record a new cash-in or cash-out transaction</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}{" "}
          <Link href="/dashboard" className="font-semibold underline ml-1">
            View dashboard
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card space-y-5">
        {/* Type selector */}
        <div>
          <label className="form-label">Transaction Type</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setType("CASH_IN")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === "CASH_IN"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">↑</div>
              <div className="font-semibold text-sm">Cash-In</div>
              <div className="text-xs opacity-70">Customer deposits</div>
            </button>
            <button
              type="button"
              onClick={() => setType("CASH_OUT")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                type === "CASH_OUT"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">↓</div>
              <div className="font-semibold text-sm">Cash-Out</div>
              <div className="text-xs opacity-70">Customer withdrawals</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="form-label">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">GH₵</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input pl-12"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Commission */}
          <div>
            <label className="form-label">
              Commission earned{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">GH₵</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input pl-12"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter the network commission you earn from this transaction</p>
          </div>

          {/* Phone number */}
          <div>
            <label className="form-label">
              Customer phone number{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              className="form-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="024 000 0000"
            />
          </div>

          {/* Note */}
          <div>
            <label className="form-label">
              Note{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. MTN MoMo, Vodafone Cash..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? "Recording..." : `Record ${type === "CASH_IN" ? "Cash-In" : "Cash-Out"}`}
            </button>
            <Link href="/dashboard" className="btn-secondary py-3 px-4">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Help tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">How it works</p>
        <ul className="space-y-1 text-blue-600 text-xs list-disc list-inside">
          <li><strong>Cash-In:</strong> Customer gives you cash, you send them MoMo. Your cash balance increases.</li>
          <li><strong>Cash-Out:</strong> Customer gives you MoMo, you give them cash. Your cash balance decreases.</li>
          <li>Add your commission separately — it helps track your daily profit.</li>
        </ul>
      </div>
    </div>
  )
}
