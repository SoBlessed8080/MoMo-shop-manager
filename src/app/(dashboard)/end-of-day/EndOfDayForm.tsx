"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatGHS } from "@/lib/calculations"

interface Props {
  defaultStartingFloat: number
  currentActualCash: number | null
  currentNotes: string
  transactionCount: number
  expectedCash: number
}

export default function EndOfDayForm({
  defaultStartingFloat,
  currentActualCash,
  currentNotes,
  transactionCount,
  expectedCash,
}: Props) {
  const router = useRouter()
  const [startingFloat, setStartingFloat] = useState(String(defaultStartingFloat))
  const [actualCash, setActualCash] = useState(currentActualCash !== null ? String(currentActualCash) : "")
  const [notes, setNotes] = useState(currentNotes)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const previewDiff = actualCash ? parseFloat(actualCash) - expectedCash : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/daily-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startingFloat: parseFloat(startingFloat),
        actualCash: actualCash ? parseFloat(actualCash) : undefined,
        notes,
      }),
    })

    setLoading(false)

    if (res.ok) {
      setMessage("Saved successfully!")
      router.refresh()
    } else {
      setMessage("Failed to save. Please try again.")
    }
  }

  return (
    <div className="card space-y-5">
      <h2 className="font-semibold text-gray-900">Configure Day Settings</h2>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            message.includes("Failed")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Starting Float (GH₵)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">GH₵</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input pl-12"
              value={startingFloat}
              onChange={(e) => setStartingFloat(e.target.value)}
              placeholder="500.00"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">The cash you started the day with</p>
        </div>

        <div>
          <label className="form-label">
            Actual Cash in Hand (GH₵){" "}
            {transactionCount === 0 && (
              <span className="text-yellow-600 font-normal text-xs">(no transactions yet today)</span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">GH₵</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input pl-12"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="Enter physical cash count"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Count your physical cash and enter it here. Expected: <strong>{formatGHS(expectedCash)}</strong>
          </p>

          {/* Live preview */}
          {previewDiff !== null && (
            <div
              className={`mt-2 p-3 rounded-lg text-sm font-medium ${
                Math.abs(previewDiff) < 0.01
                  ? "bg-green-50 text-green-700"
                  : previewDiff < 0
                  ? "bg-red-50 text-red-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {Math.abs(previewDiff) < 0.01
                ? "✅ Balanced — no discrepancy"
                : previewDiff < 0
                ? `⚠️ ${formatGHS(Math.abs(previewDiff))} missing`
                : `📈 ${formatGHS(Math.abs(previewDiff))} surplus`}
            </div>
          )}
        </div>

        <div>
          <label className="form-label">Notes (optional)</label>
          <input
            type="text"
            className="form-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any remarks for today..."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Saving..." : "Save End-of-Day Record"}
        </button>
      </form>
    </div>
  )
}
