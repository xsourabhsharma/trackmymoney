export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-8">
      {}
      <div className="h-8 w-48 rounded-xl bg-[var(--bg-surface)] animate-shimmer" />
      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[var(--bg-surface)] animate-shimmer" />
        ))}
      </div>
      {}
      <div className="h-64 rounded-3xl bg-[var(--bg-surface)] animate-shimmer" />
    </div>
  )
}
