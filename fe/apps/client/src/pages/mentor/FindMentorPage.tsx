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
import { useAvailableTeachers, useMentors } from "@/features/mentor/hooks/use-mentors";
import { toDateString } from "@/features/mentor/config/slots";
import type { MentorListItem } from "@/features/mentor/types/mentor.type";

const getAvatarSrc = (mentor: MentorListItem): string => {
    if (mentor.avatarUrl) return mentor.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=F38181&color=fff&bold=true`;
};

export const FindMentorPage = () => {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(6);

    const today = toDateString(new Date());

    const { data: availableRes, isLoading: availableLoading } =
        useAvailableTeachers(today);

    const { data, isLoading, isError } = useMentors({
        page: 1,
        limit: 100,
        keyword: search || undefined,
    });

    const availableIds = useMemo(
        () => new Set((availableRes?.data ?? []).map((t) => t.id)),
        [availableRes],
    );
    const availableTotal = availableRes?.meta?.total ?? 0;

    const filteredMentors = useMemo(() => {
        let list = (data?.data ?? []).filter((m) => availableIds.has(m.id));
        if (sortBy === "rating") {
            list = [...list].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
        }
        return list;
    }, [data, availableIds, sortBy]);

    const totalItems = filteredMentors.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedMentors = filteredMentors.slice(
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
                        Certified CEFR Mentorship
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Find & Book Your Dedicated CEFR Coach
                    </h1>
                    <p className="text-slate-600 text-base mt-1 font-normal">
                        Native-level mentors specialized in conversational
                        rhythm and eliminating speech pauses.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>
                        {availableLoading
                            ? "Loading coaches..."
                            : `${availableTotal} Coaches Available`}
                    </span>
                </div>
            </div>

            {/* Search & Sort */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={20}
                        />
                        <Input
                            className="pl-11 bg-slate-50 rounded-xl border-slate-200 focus:border-piemind-pink focus:bg-white text-sm font-medium placeholder:text-slate-400"
                            placeholder="Search mentors by name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
                            <CheckCircle size={14} className="text-piemind-pink" />
                            <span>PiEMind Plan Included</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span className="font-medium">Sort:</span>
                            <select
                                className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 py-1.5 pl-2.5 pr-6 cursor-pointer outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recommended">AI Recommended</option>
                                <option value="rating">Highest Rated</option>
                                <option value="earliest">Earliest Slot</option>
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
                    We couldn't load mentors. Please try again.
                </div>
            )}

            {/* Active Count */}
            {!showLoading && !isError && (
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                    <span>
                        Showing{" "}
                        <strong className="text-slate-800 font-bold">
                            {totalItems === 0
                                ? 0
                                : `${(safePage - 1) * limit + 1}–${Math.min(safePage * limit, totalItems)}`}
                        </strong>{" "}
                        of{" "}
                        <strong className="text-slate-800 font-bold">
                            {totalItems}
                        </strong>{" "}
                        available coaches
                    </span>
                    <span className="text-piemind-pink font-bold flex items-center gap-1">
                        <Zap size={14} />
                        Instant calendar booking
                    </span>
                </div>
            )}

            {/* Mentor Cards Grid */}
            {!showLoading && !isError && paginatedMentors.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="size-8 text-slate-400" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">
                        {search ? "No mentors match your search" : "No coaches available right now"}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-sm">
                        {search
                            ? "Try a different name or clear the search."
                            : "Check back soon — coaches update their schedules regularly."}
                    </p>
                    {search && (
                        <button
                            type="button"
                            className="mt-4 text-sm font-bold text-piemind-pink hover:underline"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {!showLoading && !isError && paginatedMentors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedMentors.map((mentor) => (
                        <article
                            key={mentor.id}
                            className="bg-white rounded-2xl p-6 border border-piemind-pink/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                                            <img
                                                alt={mentor.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                src={getAvatarSrc(mentor)}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                                                {mentor.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                                                {mentor.headline || "CEFR Coach"}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star
                                                    size={14}
                                                    className="text-amber-500 fill-current"
                                                />
                                                <span className="text-xs font-extrabold text-slate-800">
                                                    {Number(mentor.avgRating || 0).toFixed(1)}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    ({mentor.totalStudents} students)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-piemind-green text-emerald-800 border border-piemind-mint">
                                        Available
                                    </span>
                                </div>

                                {mentor.bio && (
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                                        &quot;{mentor.bio}&quot;
                                    </p>
                                )}

                                <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Clock size={14} className="text-slate-400" />
                                        <span>Available today</span>
                                    </div>
                                    <span className="font-bold text-piemind-pink">
                                        Plan Included
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                                <Link
                                    to={`/mentors/${mentor.id}/book`}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-piemind-pink hover:bg-piemind-pink/90 text-white text-xs font-bold transition-all text-center cursor-pointer"
                                >
                                    Book Discovery
                                </Link>
                                <Link
                                    to={`/mentors/${mentor.id}/book`}
                                    className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    View Profile
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
                    itemLabel="mentors"
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
