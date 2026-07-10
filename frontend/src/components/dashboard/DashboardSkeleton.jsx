const DashboardSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="flex justify-between items-start bg-white border border-zinc-200/90 rounded-xl p-5 shadow-md">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-indigo-100 rounded-lg" />
        <div className="h-4 w-40 bg-violet-50 rounded-md" />
        <div className="h-5 w-32 bg-indigo-50 rounded-md" />
      </div>
      <div className="h-10 w-36 bg-indigo-100 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 bg-white border border-zinc-200/90 border-t-[3px] border-t-indigo-200 rounded-xl shadow-md"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="h-52 bg-white border border-zinc-200/90 rounded-xl shadow-md" />
      <div className="h-52 bg-white border border-zinc-200/90 rounded-xl shadow-md" />
    </div>
    <div className="h-40 bg-white border border-zinc-200/90 rounded-xl shadow-md" />
  </div>
);

export default DashboardSkeleton;
