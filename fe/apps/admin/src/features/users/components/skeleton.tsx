import { Skeleton } from "@fe/components/ui/skeleton"
import { Separator } from "@fe/components/ui/separator"

interface PageSkeletonProps {
    rows?: number
    withAvatar?: boolean
}

export function PageSkeleton({ rows = 4, withAvatar = false }: PageSkeletonProps) {
    return (
        <div className="p-6 mx-auto space-y-6">
            <Skeleton className="h-8 w-24" />
            <div className="rounded-xl border bg-card p-6 space-y-4 min-h-[600px]">
                {withAvatar && (
                    <>
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                        <Separator />
                    </>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: rows }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}