export default function AutoParseLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-8 w-48 rounded-xl bg-[var(--bg-surface)] animate-shimmer" />
      <div className="h-64 rounded-3xl bg-[var(--bg-surface)] animate-shimmer" />
      <div className="h-48 rounded-3xl bg-[var(--bg-surface)] animate-shimmer" />
    </div>
  )
}
