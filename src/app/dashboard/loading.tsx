export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse p-2">
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-[400px] dark:bg-zinc-900 dark:border-zinc-800">
          <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded mb-4"></div>
          <div className="flex items-center justify-center h-full pb-10">
            <div className="h-64 w-full bg-gray-100 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>
        <div className="flex flex-col gap-8 pt-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-[180px] dark:bg-zinc-900 dark:border-zinc-800"></div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-[180px] dark:bg-zinc-900 dark:border-zinc-800"></div>
        </div>
      </div>
    </div>
  )
}
