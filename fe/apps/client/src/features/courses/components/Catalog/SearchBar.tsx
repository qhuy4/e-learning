interface SearchBarProps {
  search: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const SearchBar = ({ search, sort, onSearchChange, onSortChange }: SearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#95E1D3] focus:border-[#95E1D3] sm:text-sm shadow-sm transition-shadow hover:shadow-md focus:shadow-md"
        />
      </div>

      <div className="relative w-full sm:w-48">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="block w-full pl-4 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#95E1D3] focus:border-[#95E1D3] sm:text-sm rounded-lg bg-white cursor-pointer appearance-none shadow-sm transition-shadow hover:shadow-md focus:shadow-md text-slate-600"
        >
          <option value="popular">Phổ biến nhất</option>
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá: Thấp đến cao</option>
          <option value="price-desc">Giá: Cao đến thấp</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <span className="material-symbols-outlined text-sm">sort</span>
        </div>
      </div>
    </div>
  );
};
