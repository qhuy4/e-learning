interface ActiveFilter {
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

export const ActiveFilters = ({ filters, onClearAll }: ActiveFiltersProps) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-10">
      {filters.map((filter) => (
        <span
          key={filter.label}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 border border-[#F38181]/20 text-[#F38181]"
        >
          {filter.label}
          <button
            onClick={filter.onRemove}
            className="ml-2 inline-flex text-[#F38181] hover:text-rose-600"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-slate-400 underline decoration-slate-300 hover:decoration-[#F38181] hover:text-[#F38181] font-medium ml-2 transition-all"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  );
};
