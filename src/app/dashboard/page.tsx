export default async function DashboardOverview() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          + Add Transaction
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">$0.00</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">$0.00</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">$0.00</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="p-6 text-center text-sm text-gray-500">
          No transactions found. Add one to get started.
        </div>
      </div>
    </div>
  )
}
