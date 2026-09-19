import { useState } from "react";
import { Link } from "react-router";
import {
  CourseSidebar,
  CourseCard,
  ActiveFilters,
  CoursePagination,
  SearchBar,
} from "../components/Catalog";
import { useCatalogCourses } from "../hooks/use-course-catalog";

const CATEGORIES = [
  { name: "Lập trình", count: 120 },
  { name: "Thiết kế", count: 85 },
  { name: "Marketing", count: 42 },
  { name: "Kinh doanh", count: 64 },
  { name: "Nhiếp ảnh", count: 28 },
];

const LEVELS = [
  { name: "Cơ bản", value: 1 },
  { name: "Trung bình", value: 2 },
  { name: "Nâng cao", value: 3 },
];

export const CourseCatalogPage = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [minRating, setMinRating] = useState(0);

  const { data, isLoading } = useCatalogCourses({
    page,
    limit: 12,
    keyword: search || undefined,
    levels: selectedLevels.length > 0 ? selectedLevels : undefined,
    price: priceFilter !== "all" ? priceFilter : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    sort: sort !== "popular" ? sort : undefined,
  });

  const courses = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const activeFilters = [
    ...selectedCategories.map((c) => ({
      label: c,
      onRemove: () => setSelectedCategories((prev) => prev.filter((x) => x !== c)),
    })),
    ...selectedLevels.map((l) => ({
      label: LEVELS.find((x) => x.value === l)?.name || "",
      onRemove: () => setSelectedLevels((prev) => prev.filter((x) => x !== l)),
    })),
    ...(priceFilter !== "all"
      ? [
          {
            label: priceFilter === "free" ? "Miễn phí" : "Trả phí",
            onRemove: () => setPriceFilter("all"),
          },
        ]
      : []),
    ...(minRating > 0
      ? [
          {
            label: `${minRating} sao & trở lên`,
            onRemove: () => setMinRating(0),
          },
        ]
      : []),
  ];

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceFilter("all");
    setMinRating(0);
    setSearch("");
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const handleLevelChange = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row min-h-[calc(100vh-72px)]">
      <CourseSidebar
        categories={CATEGORIES}
        levels={LEVELS}
        selectedCategories={selectedCategories}
        selectedLevels={selectedLevels}
        priceFilter={priceFilter}
        minRating={minRating}
        onCategoryChange={handleCategoryChange}
        onLevelChange={handleLevelChange}
        onPriceChange={setPriceFilter}
        onRatingChange={setMinRating}
        onReset={handleReset}
      />

      <main className="flex-1 p-8 lg:p-12">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link to="/" className="hover:text-[#F38181] transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <Link to="/courses" className="hover:text-[#F38181] transition-colors">
            Khóa học
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-slate-800 font-semibold">Tất cả danh mục</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between mb-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-slate-900">
              Khám Phá Khóa Học
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Tìm hiểu kỹ năng mới và mở rộng tầm nhìn với chương trình giảng dạy chuyên nghiệp
              từ các chuyên gia hàng đầu.
            </p>
          </div>
          <SearchBar
            search={search}
            sort={sort}
            onSearchChange={handleSearchChange}
            onSortChange={setSort}
          />
        </div>

        <ActiveFilters filters={activeFilters} onClearAll={handleReset} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">search_off</span>
            <p className="text-slate-400 text-lg">Không tìm thấy khóa học nào phù hợp</p>
            <button
              onClick={handleReset}
              className="mt-4 text-[#95E1D3] font-semibold hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <CoursePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </main>
    </div>
  );
};
