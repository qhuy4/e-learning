import { Badge } from "@fe/components/ui/badge";
import { ShieldCheck, Clock, Video } from "lucide-react";

interface BookingHeroProps {
    mentorName: string;
}

export function BookingHero({ mentorName }: BookingHeroProps) {
    return (
        <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <ShieldCheck className="size-3.5" />
                    Miễn phí 100% · Không cần thẻ
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-card text-foreground border-border font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <Clock className="size-3.5 text-muted-foreground" />
                    Thời lượng linh hoạt
                </Badge>
                <Badge
                    variant="outline"
                    className="bg-card text-foreground border-border font-semibold px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5"
                >
                    <Video className="size-3.5 text-muted-foreground" />
                    Phòng video 1-1 trực tuyến
                </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Đặt lịch buổi tư vấn miễn phí
            </h1>
            <p className="mt-2.5 max-w-3xl text-muted-foreground text-base leading-relaxed">
                Gặp gỡ 1-1 với {mentorName} để đánh giá nhịp hội thoại của bạn,
                xác định các điểm gây ngập ngừng và xây dựng lộ trình cá nhân
                hóa — hoàn toàn không ràng buộc.
            </p>
        </header>
    );
}
