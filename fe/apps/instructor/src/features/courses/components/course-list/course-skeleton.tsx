export function CourseListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
        >
          <div className="aspect-video bg-muted animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
            <div className="pt-4 border-t border-border flex justify-between">
              <div className="h-5 bg-muted rounded animate-pulse w-20" />
              <div className="flex gap-1">
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
