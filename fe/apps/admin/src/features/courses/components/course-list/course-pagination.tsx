import { Button } from "@fe/components/ui/button";

interface CoursePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function CoursePagination({
  page,
  totalPages,
  total,
  onPageChange,
}: CoursePaginationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Tổng <span className="font-semibold text-foreground">{total}</span>{" "}
        khóa học &bull; Trang{" "}
        <span className="font-semibold text-foreground">{page}</span> /{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="h-9 px-4"
        >
          ← Trang trước
        </Button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 py-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p as number)}
                  className="h-9 w-9 p-0"
                >
                  {p}
                </Button>
              )
            )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 px-4"
        >
          Trang sau →
        </Button>
      </div>
    </div>
  );
}
