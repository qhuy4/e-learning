import { Link } from "react-router";
import { Skeleton } from "@fe/components/ui/skeleton";

export function BookingLoading() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-56 w-full rounded-2xl" />
                </div>
                <div className="lg:col-span-4">
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </div>
        </main>
    );
}

export function BookingNotFound() {
    return (
        <main className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-extrabold text-foreground">
                Không tìm thấy giảng viên
            </h1>
            <p className="text-muted-foreground mt-2">
                Không thể tải hồ sơ giảng viên bạn yêu cầu.
            </p>
            <Link
                to="/instructors"
                className="mt-6 inline-flex h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                Quay lại danh sách giảng viên
            </Link>
        </main>
    );
}
