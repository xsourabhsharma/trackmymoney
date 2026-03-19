export default function BudgetsLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-gray-100 dark:bg-zinc-900 border-4 border-[#141414]/10"></div>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-64 w-full bg-white dark:bg-zinc-900 border-4 border-[#141414]/10"></div>)}
      </div>
    </div>
  )
}
