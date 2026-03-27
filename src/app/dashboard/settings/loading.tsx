export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="h-8 w-40 rounded-xl bg-[var(--bg-surface)] animate-shimmer" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-[var(--bg-surface)] animate-shimmer" />
      ))}
    </div>
  )
}
