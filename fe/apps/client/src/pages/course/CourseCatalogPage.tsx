import { useState } from "react";
import { Link } from "react-router";
import {
  Search,
  Star,
  ChevronRight,
  Sparkles,
  Mic,
  BookOpen,
  BarChart3,
  LockOpen,
  ArrowLeft,
  Home,
  CheckCircle,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Skeleton } from "@fe/components/ui/skeleton";
import { Card } from "@fe/components/ui/card";
import { Pagination } from "@fe/components/common/Pagination";
import { useCatalogCourses, useCatalogStats } from "@/features/courses/hooks/use-course-catalog";
import type { CatalogCourse } from "@/features/courses/components/Catalog/types";

const levelMap: Record<number, { label: string; cefr: string; group: string }> = {
  1: { label: "Beginner", cefr: "A1-A2", group: "beginner" },
  2: { label: "Intermediate", cefr: "B1-B2", group: "intermediate" },
  3: { label: "Advanced", cefr: "B2-C1", group: "advanced" },
};

const skillTags = [
  { label: "Speaking Fluency", icon: "🗣" },
  { label: "Pronunciation & Phonemes", icon: "🎵" },
  { label: "Workplace & Business", icon: "💼" },
  { label: "IELTS / TOEFL Prep", icon: "🎓" },
  { label: "Grammar & Sentence Agility", icon: "✍" },
];

const formatPrice = (price: number) => {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price / 1000);
};

const getInitials = (name: string | null) => {
  if (!name) return "G";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const CourseCatalogPage = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [activeLevelTab, setActiveLevelTab] = useState("all");
  const [activeSkillTags, setActiveSkillTags] = useState<string[]>([]);

  const { data: stats } = useCatalogStats();
  const { data, isLoading } = useCatalogCourses({
    page,
    limit,
    keyword: search || undefined,
    levels: selectedLevels.length > 0 ? selectedLevels : undefined,
    sort: sort !== "popular" ? sort : undefined,
  });

  const levelTabs = [
    { id: "all", label: "All Levels", count: stats?.total ?? 0 },
    { id: "beginner", label: "Beginner A1-A2", count: stats?.beginner ?? 0 },
    { id: "intermediate", label: "Intermediate B1-B2", count: stats?.intermediate ?? 0 },
    { id: "advanced", label: "Advanced C1", count: stats?.advanced ?? 0 },
  ];

  const courses = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalItems = data?.meta?.total ?? 0;

  const handleLevelTabClick = (tabId: string) => {
    setActiveLevelTab(tabId);
    if (tabId === "all") {
      setSelectedLevels([]);
    } else if (tabId === "beginner") {
      setSelectedLevels([1]);
    } else if (tabId === "intermediate") {
      setSelectedLevels([2]);
    } else if (tabId === "advanced") {
      setSelectedLevels([3]);
    }
    setPage(1);
  };

  const toggleSkillTag = (label: string) => {
    setActiveSkillTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-m3-secondary-fixed/40 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-72 -left-20 w-80 h-80 rounded-full bg-m3-primary-fixed/30 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-m3-tertiary-fixed/30 blur-3xl -z-10 pointer-events-none" />

      {/* 1. BREADCRUMBS & HERO */}
      <section className="mb-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-lg text-sm text-m3-on-surface-variant mb-6">
          <Link to="/" className="hover:text-m3-primary transition-colors flex items-center gap-1">
            <Home size={16} />
            Home
          </Link>
          <ChevronRight size={14} className="text-m3-outline-variant" />
          <span className="text-m3-on-surface font-bold">Course Catalog</span>
          <span className="ml-3 px-2.5 py-0.5 rounded-full bg-m3-surface-container-high text-xs font-semibold text-m3-secondary flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-m3-secondary animate-pulse" />
            Guest Explorer Mode
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Value Pitch */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-piemind-pink text-white text-xs font-bold self-start">
              <Sparkles size={16} />
              CEFR-Aligned · Powered by PiEMind Acoustics™
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-m3-on-surface leading-tight">
              Find Your Ideal English Path —{" "}
              <br className="hidden sm:inline" />
              <span className="text-piemind-pink underline decoration-m3-primary-fixed decoration-wavy decoration-2 underline-offset-4">
                Powered by Adaptive AI
              </span>
            </h1>
            <p className="text-sm text-m3-on-surface-variant max-w-xl leading-relaxed">
              Browse structured CEFR-aligned courses from A1 beginner to C1 native proficiency.
              Not sure where your fluency stands? Pie listens to your natural voice and builds a
              bespoke curriculum in minutes.
            </p>
            {/* Quick Stat Counters */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-piemind-pink/20 flex items-center justify-center text-piemind-pink">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-bold text-m3-on-surface text-lg">{stats?.total ?? 0} Courses</p>
                  <p className="text-xs text-m3-on-surface-variant">A1 to C1 Fluency Tracks</p>
                </div>
              </div>
              <div className="w-px h-8 bg-m3-outline-variant/50 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-piemind-mint/30 flex items-center justify-center text-piemind-mint">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <p className="font-bold text-m3-on-surface text-lg">94.8% Agility</p>
                  <p className="text-xs text-m3-on-surface-variant">Average Pause Reduction</p>
                </div>
              </div>
              <div className="w-px h-8 bg-m3-outline-variant/50 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-m3-surface-container-highest flex items-center justify-center text-m3-tertiary">
                  <LockOpen size={20} />
                </div>
                <div>
                  <p className="font-bold text-m3-on-surface text-lg">Free Previews</p>
                  <p className="text-xs text-m3-on-surface-variant">No Credit Card Needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mascot Teaser Card */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-m3-surface-container-lowest to-m3-surface-container-low rounded-xl p-6 flex flex-col justify-between overflow-hidden border border-m3-outline-variant/30">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-m3-primary-container/20 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="bg-m3-surface-container-lowest rounded-2xl px-4 py-2.5 text-xs text-m3-on-surface-variant font-medium max-w-[210px] relative border border-m3-outline-variant/30">
                <p className="text-m3-on-surface font-semibold mb-0.5">
                  "Hi friend! Let's skip the guesswork."
                </p>
                <p className="text-[11px] text-m3-on-surface-variant">
                  I can analyze your cadence in 10 minutes.
                </p>
                <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-m3-surface-container-lowest transform rotate-45" />
              </div>
              <span className="px-3 py-1 rounded-full bg-m3-secondary text-m3-on-secondary text-xs font-bold whitespace-nowrap">
                Zero Pressure Test
              </span>
            </div>
            <div className="relative z-10 flex items-center justify-center my-3">
              <div className="relative group">
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-m3-primary-container via-m3-tertiary-fixed to-m3-secondary-fixed p-1.5 transform transition-transform group-hover:scale-105 duration-300">
                  <img
                    alt="Pie AI Mascot"
                    className="w-full h-full object-cover rounded-full bg-m3-surface-container-high"
                    src="/logo.webp"
                  />
                </div>
                <div className="absolute -bottom-2 -right-1 bg-m3-surface-container-lowest rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-m3-outline-variant/30">
                  <CheckCircle size={14} className="text-m3-secondary" />
                  <span className="text-xs font-bold text-m3-on-surface">Pie AI</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 space-y-3">
              <div className="text-center">
                <h2 className="text-base font-bold text-m3-on-surface">
                  Instant Spoken Pause Analysis
                </h2>
                <p className="text-xs text-m3-on-surface-variant mt-0.5">
                  Detects CEFR grammar agility, lexical reach, and phoneme clarity
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                <Link
                  to="/student/register"
                  className="flex-1 bg-m3-primary-container text-white font-bold py-2.5 px-4 rounded-full text-center hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-sm cursor-pointer"
                >
                  <Mic size={16} />
                  Take Free Test
                </Link>
                <Button
                  variant="outline"
                  className="rounded-full font-semibold text-sm border-m3-surface-container-high hover:bg-m3-surface-variant cursor-pointer"
                >
                  <BarChart3 size={16} className="mr-1" />
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <Card className="mb-10 p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-outline" size={20} />
            <Input
              className="pl-12 pr-10 py-3.5 rounded-lg bg-m3-surface-container-low text-m3-on-surface placeholder:text-m3-outline text-sm focus:outline-none focus:bg-m3-surface transition-all border border-border cursor-text"
              placeholder="Search by course title, skill, IELTS/CEFR goal, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-m3-on-surface-variant whitespace-nowrap font-semibold">Sort by:</span>
              <select
                className="appearance-none bg-m3-surface-container-low text-m3-on-surface text-xs font-semibold py-2 pl-3 pr-8 rounded-full cursor-pointer focus:outline-none focus:bg-m3-surface-container-high transition-colors"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Curriculum</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            <div className="text-xs text-m3-on-surface-variant font-semibold whitespace-nowrap px-3 py-1.5 rounded-full bg-m3-surface-container-low">
              Showing <strong className="text-m3-on-surface font-bold">{(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)}</strong> of{" "}
              {totalItems}
            </div>
          </div>
        </div>

        {/* CEFR Level Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-transparent">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-m3-on-surface mr-1 flex items-center gap-1">
              <BarChart3 size={14} className="text-m3-primary" /> Level:
            </span>
            {levelTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleLevelTabClick(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeLevelTab === tab.id
                    ? "bg-m3-primary-container text-white"
                    : "bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant hover:text-m3-on-surface"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setActiveLevelTab("all");
              setSelectedLevels([]);
              setActiveSkillTags([]);
              setSearch("");
              setPage(1);
            }}
            className="text-xs text-m3-primary font-bold hover:underline self-end md:self-auto flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={12} /> Reset Filters
          </button>
        </div>

        {/* Skill Tag Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-m3-on-surface-variant font-semibold">Focus Areas:</span>
          {skillTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => toggleSkillTag(tag.label)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSkillTags.includes(tag.label)
                  ? "bg-m3-secondary-fixed text-m3-on-secondary-fixed-variant"
                  : "bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant transition-colors"
              }`}
            >
              <span>{tag.icon}</span>
              {tag.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 3. COURSE GRID */}
      <section className="mb-14">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-primary/30 rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-m3-outline-variant mb-4" />
            <p className="text-m3-on-surface-variant text-lg font-semibold">No courses found</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedLevels([]);
                setActiveLevelTab("all");
                setPage(1);
              }}
              className="mt-4 text-m3-primary font-bold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* 4. PAGINATION */}
      <Pagination
        page={page}
        onPageChange={setPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemLabel="courses"
        limit={limit}
        onLimitChange={setLimit}
        limitOptions={[8, 16, 24]}
      />

      {/* 6. BOTTOM CTA */}
      <section className="mb-12">
        <div className="relative bg-gradient-to-br from-m3-on-background via-m3-inverse-surface to-m3-on-background text-m3-inverse-on-surface rounded-xl p-8 lg:p-12 overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-m3-primary-container/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-m3-secondary/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-m3-primary-fixed text-xs font-bold backdrop-blur-sm">
                Instant Access · No Credit Card
              </span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-snug">
                Ready to speak English naturally without mid-clause hesitation?
              </h2>
              <p className="text-sm text-m3-surface-variant max-w-2xl leading-relaxed">
                Create a free guest account in 30 seconds to unlock the first lesson of all 36
                courses and receive a detailed diagnostic voice report from Pie.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                to="/student/register"
                className="w-full bg-m3-primary-container hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-full text-center transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Sparkles size={18} />
                Create Free Account
              </Link>
              <Link
                to="/student/register"
                className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 px-6 rounded-full text-center backdrop-blur-sm transition-all flex items-center justify-center gap-2 border border-white/20 text-sm cursor-pointer"
              >
                <Mic size={18} />
                Take AI Placement Test
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─── Course Card (internal) ─── */
function CourseCard({ course }: { course: CatalogCourse }) {
  const info = levelMap[course.level] ?? levelMap[1];

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group border border-primary/30 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-m3-surface-container-high">
          {course.thumbnail ? (
            <img
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={course.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={40} className="text-m3-outline-variant" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <span className="px-2 py-0.5 rounded-full bg-m3-secondary/80 backdrop-blur-sm text-m3-on-secondary font-bold">
              CEFR {info.cefr}
            </span>
            <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <Star size={12} className="text-m3-tertiary-fixed fill-current" />
              {course.avgRating} ({course.reviewCount})
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2">
          <span className="text-xs font-bold text-m3-secondary tracking-wider uppercase">
            {info.label}
          </span>
          <h3 className="text-lg font-semibold text-m3-on-surface line-clamp-2 group-hover:text-m3-primary transition-colors leading-snug">
            {course.title}
          </h3>
          <p className="text-sm text-m3-on-surface-variant line-clamp-2">
            Master English fluency with AI-powered lessons and real-time feedback.
          </p>

          {/* Instructor */}
          <div className="pt-2 flex items-center gap-2">
            {course.instructorAvatar ? (
              <img
                alt={course.instructorName || ""}
                className="w-6 h-6 rounded-full object-cover"
                src={course.instructorAvatar}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-m3-surface-container-high flex items-center justify-center text-[10px] font-bold text-m3-on-surface">
                {getInitials(course.instructorName)}
              </div>
            )}
            <span className="text-xs text-m3-on-surface-variant font-medium">
              {course.instructorName || "Instructor"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 pt-0">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-bold text-lg text-m3-on-surface">
            {course.price === 0 ? "Free" : formatPrice(course.price)}
          </span>
          {course.price === 0 && (
            <span className="text-[11px] font-bold text-m3-secondary bg-m3-secondary-fixed/50 px-2 py-0.5 rounded-full">
              Lesson 1 Free
            </span>
          )}
        </div>
        <Button
          className="w-full rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs cursor-pointer"
          size="sm"
        >
          Start Free Preview
        </Button>
      </div>
    </Link>
  );
}
