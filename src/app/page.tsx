import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-semibold text-gray-900 text-lg">MoMo Manager</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary text-sm">
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Built for Ghana Mobile Money Agents
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Know exactly where
          <br />
          <span className="text-blue-600">your money stands</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Track cash-in, cash-out, float balance, and automatically detect discrepancies at the end of each day.
          No more manual counting errors.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-6 py-3">
            Start for free
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Demo: demo@momoshop.gh
          </Link>
        </div>
      </section>

      {/* Discrepancy banner mock */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-400">MoMo Manager – Daily Dashboard</span>
          </div>

          {/* Mock discrepancy alert */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-700 font-semibold text-sm">
              Cash mismatch detected: GH 45.00 is unaccounted for
            </p>
            <p className="text-red-500 text-xs mt-1">Expected: GH 1,250.00 | Actual: GH 1,205.00</p>
          </div>

          {/* Mock stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Expected Cash", value: "GH 1,250.00", color: "blue" },
              { label: "Actual Cash", value: "GH 1,205.00", color: "red" },
              { label: "Difference", value: "- GH 45.00", color: "red" },
              { label: "Today Profit", value: "GH 12.50", color: "green" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-lg border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p
                  className={`font-bold text-sm ${
                    card.color === "red"
                      ? "text-red-600"
                      : card.color === "green"
                      ? "text-green-600"
                      : "text-blue-600"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Everything a MoMo agent needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "📊",
              title: "Real-time Balance Tracking",
              desc: "Every cash-in and cash-out transaction instantly updates your expected float balance.",
            },
            {
              icon: "🚨",
              title: "Instant Discrepancy Detection",
              desc: "Compare your physical cash to the system calculation and catch errors immediately.",
            },
            {
              icon: "📋",
              title: "End-of-Day Reports",
              desc: "Auto-generated daily reports with totals, commissions, and any cash mismatches.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your float?</h2>
        <p className="text-blue-100 mb-8">Join agents across Ghana using MoMo Manager every day.</p>
        <Link href="/register" className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Create your free account
        </Link>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400">
        © {new Date().getFullYear()} MoMo Shop Manager · Built for Ghana
      </footer>
    </div>
  )
}
