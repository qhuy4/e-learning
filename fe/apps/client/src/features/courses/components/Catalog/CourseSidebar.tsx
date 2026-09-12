interface CourseSidebarProps {
  categories: { name: string; count: number }[];
  levels: { name: string; value: number }[];
  selectedCategories: string[];
  selectedLevels: number[];
  priceFilter: "all" | "free" | "paid";
  minRating: number;
  onCategoryChange: (category: string) => void;
  onLevelChange: (level: number) => void;
  onPriceChange: (price: "all" | "free" | "paid") => void;
  onRatingChange: (rating: number) => void;
  onReset: () => void;
}

export const CourseSidebar = ({
  categories,
  levels,
  selectedCategories,
  selectedLevels,
  priceFilter,
  minRating,
  onCategoryChange,
  onLevelChange,
  onPriceChange,
  onRatingChange,
  onReset,
}: CourseSidebarProps) => {
  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 border-r border-gray-100 p-8 hidden md:block overflow-y-auto h-[calc(100vh-72px)] sticky top-[73px] bg-white z-40">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#95E1D3]">tune</span>{" "}
          Bộ lọc
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-[#F38181] uppercase tracking-wide"
        >
          Đặt lại
        </button>
      </div>

      <CategoryFilter
        categories={categories}
        selected={selectedCategories}
        onChange={onCategoryChange}
      />

      <LevelFilter
        levels={levels}
        selected={selectedLevels}
        onChange={onLevelChange}
      />

      <PriceFilter value={priceFilter} onChange={onPriceChange} />

      <RatingFilter value={minRating} onChange={onRatingChange} />
    </aside>
  );
};

function CategoryFilter({
  categories,
  selected,
  onChange,
}: {
  categories: { name: string; count: number }[];
  selected: string[];
  onChange: (c: string) => void;
}) {
  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Danh mục
      </h4>
      <div className="space-y-3">
        {categories.map((cat) => {
          const isChecked = selected.includes(cat.name);
          return (
            <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
              <input
                checked={isChecked}
                onChange={() => onChange(cat.name)}
                className="size-4 rounded border-slate-300 text-[#95E1D3] focus:ring-[#95E1D3]/50"
                type="checkbox"
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  isChecked ? "text-slate-900 font-semibold" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                {cat.name}
              </span>
              <span
                className={`ml-auto text-xs ${
                  isChecked ? "text-[#95E1D3] font-bold" : "text-slate-400"
                }`}
              >
                {cat.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function LevelFilter({
  levels,
  selected,
  onChange,
}: {
  levels: { name: string; value: number }[];
  selected: number[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Trình độ
      </h4>
      <div className="space-y-3">
        {levels.map((level) => {
          const isChecked = selected.includes(level.value);
          return (
            <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                checked={isChecked}
                onChange={() => onChange(level.value)}
                className="size-4 rounded border-slate-300 text-[#95E1D3] focus:ring-[#95E1D3]/50"
                type="checkbox"
              />
              <span
                className={`text-sm font-medium transition-colors ${
                  isChecked ? "text-slate-900 font-semibold" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                {level.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PriceFilter({
  value,
  onChange,
}: {
  value: "all" | "free" | "paid";
  onChange: (v: "all" | "free" | "paid") => void;
}) {
  const options: { label: string; value: "all" | "free" | "paid" }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Miễn phí", value: "free" },
    { label: "Trả phí", value: "paid" },
  ];

  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Giá
      </h4>
      <div className="space-y-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="size-4 border-slate-300 text-[#95E1D3] focus:ring-[#95E1D3]/50"
              name="price"
              type="radio"
            />
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function RatingFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const ratings = [4, 3];

  return (
    <div className="mb-8">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Đánh giá
      </h4>
      <div className="space-y-3">
        {ratings.map((r) => {
          const isChecked = value === r;
          return (
            <label key={r} className="flex items-center gap-3 cursor-pointer group">
              <input
                checked={isChecked}
                onChange={() => onChange(isChecked ? 0 : r)}
                className="size-4 rounded border-slate-300 text-[#95E1D3] focus:ring-[#95E1D3]/50"
                type="checkbox"
              />
              <div className="flex items-center text-[#FCE38A] text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-[18px] ${
                      i < r ? "fill-current" : "text-gray-200"
                    }`}
                  >
                    star
                  </span>
                ))}
                <span className="ml-2 text-slate-600 text-xs font-medium group-hover:text-slate-900">
                  & trở lên
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
