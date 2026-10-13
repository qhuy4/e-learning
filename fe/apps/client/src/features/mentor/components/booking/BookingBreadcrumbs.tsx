import { Link } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface BookingBreadcrumbsProps {
    mentorName: string;
}

export function BookingBreadcrumbs({ mentorName }: BookingBreadcrumbsProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
            <nav className="flex items-center gap-2 font-medium text-muted-foreground">
                <Link to="/mentors" className="hover:text-primary transition-colors flex items-center gap-1">
                    Mentor
                </Link>
                <ChevronRight className="size-4" />
                <Link to="/mentors" className="hover:text-primary transition-colors">
                    {mentorName}
                </Link>
                <ChevronRight className="size-4" />
                <span className="text-foreground font-bold">Đặt buổi tư vấn</span>
            </nav>
            <Link
                to="/mentors"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card hover:bg-muted border border-border text-foreground font-medium text-sm cursor-pointer transition-colors"
            >
                <ArrowLeft className="size-4" />
                Quay lại hồ sơ mentor
            </Link>
        </div>
    );
}
