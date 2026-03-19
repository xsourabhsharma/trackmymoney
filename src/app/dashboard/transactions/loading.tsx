export default function TransactionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>
      <div className="h-16 w-full bg-gray-100 dark:bg-zinc-900 rounded-lg border-4 border-[#141414]/10"></div>
      <div className="border-4 border-[#141414]/10 h-[600px] w-full bg-white dark:bg-zinc-900 rounded-md"></div>
    </div>
  )
}
