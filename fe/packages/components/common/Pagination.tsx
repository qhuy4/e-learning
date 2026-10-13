import { ArrowLeft, ArrowRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalItems: number;
  itemLabel?: string;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export const Pagination = ({
  page,
  onPageChange,
  totalPages,
  totalItems,
  itemLabel = "items",
  limit,
  onLimitChange,
  limitOptions,
  className,
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const start = (page - 1) * (limit ?? 8) + 1;
  const end = Math.min(page * (limit ?? 8), totalItems);
  const pages = Array.from({ length: Math.min(safeTotalPages, 4) }, (_, i) => i + 1);

  return (
    <section className={className ?? "flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-m3-outline-variant/30 px-6 py-4"}>
      <div className="flex items-center gap-2 text-xs font-semibold text-m3-on-surface-variant">
        {limitOptions && onLimitChange && (
          <>
            <span>Per page:</span>
            <select
              className="bg-m3-surface-container-low text-m3-on-surface font-bold text-xs py-1 px-2.5 rounded-full focus:outline-none cursor-pointer"
              value={limit}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(1);
              }}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-m3-outline-variant">|</span>
          </>
        )}
        <span>
          Hiển thị {start}–{end} trong {totalItems} {itemLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant transition-colors disabled:opacity-40 cursor-pointer"
        >
          <ArrowLeft size={14} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
              page === p
                ? "bg-m3-primary-container text-white"
                : "bg-m3-surface-container-low hover:bg-m3-surface-container-high text-m3-on-surface font-semibold"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === safeTotalPages}
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface-variant transition-colors disabled:opacity-40 cursor-pointer"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};
