import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
    CheckCircle,
    Clock,
    Headphones,
    Search,
    Star,
    Users,
    Zap,
} from "lucide-react";
import { Input } from "@fe/components/ui/input";
import { Pagination } from "@fe/components/common/Pagination";
import { useAvailableInstructors, useInstructors } from "@/features/instructors/hooks/use-instructors";
import { toDateString } from "@/features/instructors/config/slots";
import type { InstructorListItem } from "@/features/instructors/types/instructor.type";

const getAvatarSrc = (instructor: InstructorListItem): string => {
    if (instructor.avatarUrl) return instructor.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=F38181&color=fff&bold=true`;
};

const CERTIFICATE_TAGS = [
    "IELTS",
    "TOEIC",
    "TOEFL",
    "TESOL",
    "CELTA",
    "DELTA",
    "BUSINESS_ENGLISH",
    "GENERAL_ENGLISH",
    "KIDS",
    "PRONUNCIATION",
    "WRITING",
    "SPEAKING",
];

export const FindInstructorsPage = () => {
    const [search, setSearch] = useState("");
    const [tag, setTag] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(6);

    const today = toDateString(new Date());

    const { data: availableRes, isLoading: availableLoading } =
        useAvailableInstructors(today);

    const { data, isLoading, isError } = useInstructors({
        page: 1,
        limit: 100,
        keyword: search || undefined,
        tag: tag || undefined,
    });

    const availableIds = useMemo(
        () => new Set((availableRes?.data ?? []).map((t) => t.id)),
        [availableRes],
    );
    const availableTotal = availableRes?.meta?.total ?? 0;

    const filteredInstructors = useMemo(() => {
        let list = (data?.data ?? []).filter((m) => availableIds.has(m.id));
        if (sortBy === "rating") {
            list = [...list].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
        }
        return list;
    }, [data, availableIds, sortBy]);

    const totalItems = filteredInstructors.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedInstructors = filteredInstructors.slice(
        (safePage - 1) * limit,
        safePage * limit,
    );

    const showLoading = isLoading || availableLoading;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 w-full flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-piemind-pink text-white text-xs font-bold tracking-wide mb-2 border border-piemind-pink">
                        <Headphones size={14} />
                        Giảng viên CEFR được chứng nhận
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                        Tìm & đặt lịch cùng giảng viên CEFR của bạn
                    </h1>
                    <p className="text-muted-foreground text-base mt-1 font-normal">
                        Giảng viên trình độ bản xứ chuyên về nhịp hội thoại và
                        khắc phục các khoảng ngừng khi nói.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-card px-3.5 py-2 rounded-xl border border-border shadow-sm self-start md:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>
                        {availableLoading
                            ? "Đang tải giảng viên..."
                            : `${availableTotal} giảng viên sẵn sàng`}
                    </span>
                </div>
            </div>

            {/* Search & Sort */}
            <section className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={20}
                        />
                        <Input
                            className="pl-11 bg-muted rounded-xl border-input focus:border-piemind-pink focus:bg-background text-sm font-medium placeholder:text-muted-foreground"
                            placeholder="Tìm giảng viên theo tên..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <select
                            className="bg-card border border-border rounded-lg text-xs font-bold text-foreground py-1.5 pl-2.5 pr-6 cursor-pointer outline-none"
                            value={tag}
                            onChange={(e) => {
                                setTag(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Mọi chứng chỉ</option>
                            {CERTIFICATE_TAGS.map((item) => (
                                <option key={item} value={item}>
                                    {item.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border font-medium">
                            <CheckCircle size={14} className="text-piemind-pink" />
                            <span>Đã bao gồm gói PiEMind</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-medium">Sắp xếp:</span>
                            <select
                                className="bg-card border border-border rounded-lg text-xs font-bold text-foreground py-1.5 pl-2.5 pr-6 cursor-pointer outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recommended">Đề xuất bởi AI</option>
                                <option value="rating">Đánh giá cao nhất</option>
                                <option value="earliest">Khung giờ sớm nhất</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {showLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: limit }, (_, index) => (
                        <div
                            key={index}
                            className="h-72 rounded-2xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            )}
            {isError && (
                <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
                    Không thể tải danh sách giảng viên. Vui lòng thử lại.
                </div>
            )}

            {/* Active Count */}
            {!showLoading && !isError && (
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
                    <span>
                        Hiển thị{" "}
                        <strong className="text-foreground font-bold">
                            {totalItems === 0
                                ? 0
                                : `${(safePage - 1) * limit + 1}–${Math.min(safePage * limit, totalItems)}`}
                        </strong>{" "}
                        trong{" "}
                        <strong className="text-foreground font-bold">
                            {totalItems}
                        </strong>{" "}
                        giảng viên sẵn sàng
                    </span>
                    <span className="text-piemind-pink font-bold flex items-center gap-1">
                        <Zap size={14} />
                        Đặt lịch tức thì
                    </span>
                </div>
            )}

            {/* Instructor Cards Grid */}
            {!showLoading && !isError && paginatedInstructors.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Users className="size-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-1">
                        {search ? "Không có giảng viên nào khớp tìm kiếm" : "Hiện chưa có giảng viên nào sẵn sàng"}
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {search
                            ? "Thử tìm theo tên khác hoặc xóa từ khóa."
                            : "Hãy quay lại sau — các giảng viên cập nhật lịch thường xuyên."}
                    </p>
                    {search && (
                        <button
                            type="button"
                            className="mt-4 text-sm font-bold text-piemind-pink hover:underline"
                            onClick={() => setSearch("")}
                        >
                            Xóa tìm kiếm
                        </button>
                    )}
                </div>
            )}

            {!showLoading && !isError && paginatedInstructors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedInstructors.map((instructor) => (
                        <article
                            key={instructor.id}
                            className="bg-card rounded-2xl p-6 border border-piemind-pink/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                                            <img
                                                alt={instructor.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                src={getAvatarSrc(instructor)}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-foreground leading-snug">
                                                {instructor.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                                {instructor.headline || "Giảng viên CEFR"}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star
                                                    size={14}
                                                    className="text-amber-500 fill-current"
                                                />
                                                <span className="text-xs font-extrabold text-foreground">
                                                    {Number(instructor.avgRating || 0).toFixed(1)}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    ({instructor.totalStudents} học viên)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-piemind-green text-emerald-800 border border-piemind-mint">
                                        Sẵn sàng
                                    </span>
                                </div>

                                {instructor.certificateTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {instructor.certificateTags.slice(0, 4).map((item) => (
                                            <span
                                                key={item}
                                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border"
                                            >
                                                {item.replaceAll("_", " ")}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {instructor.bio && (
                                    <p className="text-xs text-muted-foreground leading-relaxed font-normal line-clamp-3">
                                        &quot;{instructor.bio}&quot;
                                    </p>
                                )}

                                <div className="bg-muted rounded-xl px-3.5 py-2.5 border border-border flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock size={14} className="text-muted-foreground" />
                                        <span>Sẵn sàng hôm nay</span>
                                    </div>
                                    <span className="font-bold text-piemind-pink">
                                        Đã bao gồm gói
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                                <Link
                                    to={`/instructors/${instructor.id}/book`}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-piemind-pink hover:bg-piemind-pink/90 text-white text-xs font-bold transition-all text-center cursor-pointer"
                                >
                                    Đặt buổi tư vấn
                                </Link>
                                <Link
                                    to={`/instructors/${instructor.id}/book`}
                                    className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    Xem hồ sơ
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!showLoading && !isError && totalItems > 0 && (
                <Pagination
                    page={safePage}
                    onPageChange={setCurrentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemLabel="giảng viên"
                    limit={limit}
                    onLimitChange={(next) => {
                        setLimit(next);
                        setCurrentPage(1);
                    }}
                    limitOptions={[6, 12, 24]}
                />
            )}
        </div>
    );
};
