export const MovieSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60">
      <div className="h-[360px] animate-pulse bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-700" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-slate-700" />
      </div>
    </div>
  )
}
