export default function GoalsLoading() {
  return (
    <div className="space-y-16 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
      </div>
      {[1, 2].map(section => (
        <div key={section} className="space-y-8">
          <div className="h-12 w-full bg-gray-100 dark:bg-zinc-900 border-4 border-[#141414]/10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 w-full bg-white dark:bg-zinc-900 border-4 border-[#141414]/10"></div>)}
          </div>
        </div>
      ))}
    </div>
  )
}
