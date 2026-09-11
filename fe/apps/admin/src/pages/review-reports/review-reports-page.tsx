import { useNavigate, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { Input } from "@fe/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {useReviewReports} from "@/features/review-reports/hooks/use-review-reports.ts";
import {DataTable} from "@/components/common/data-table/data-table.tsx";
import {reviewReportColumns} from "@/features/review-reports/components/report-columns.tsx";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "0", label: "Chờ xử lý" },
  { value: "1", label: "Đã xử lý" },
  { value: "2", label: "Đã từ chối" },
];

export default function ReviewReportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const statusParam = searchParams.get("status");
  const keywordParam = searchParams.get("keyword") || "";

  const [statusFilter, setStatusFilter] = useState(statusParam || "all");
  const [keyword, setKeyword] = useState(keywordParam);

  useEffect(() => {
    setStatusFilter(statusParam || "all");
    setKeyword(keywordParam);
  }, [statusParam, keywordParam]);

  const { data, isLoading } = useReviewReports(
    page,
    PAGE_SIZE,
    statusFilter !== "all" ? Number(statusFilter) : undefined,
    keywordParam || undefined,
  );

  const handleSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.set("page", "1");
    if (keyword) {
      next.set("keyword", keyword);
    } else {
      next.delete("keyword");
    }
    setSearchParams(next);
  };

  const handleStatusChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", "1");
    if (value === "all") {
      next.delete("status");
    } else {
      next.set("status", value);
    }
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  };

  const handleRowClick = (row: any) => {
    navigate(`/review-reports/${row.original.id}`);
  };

  const pagination = useMemo(
    () => ({
      page,
      total: data?.meta?.totalPages || 1,
      onPageChange: handlePageChange,
    }),
    [page, data?.meta?.totalPages],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Báo cáo đánh giá</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue>
                    {statusOptions.find((o) => o.value === statusFilter)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm lý do, học viên..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.data || []}
            columns={reviewReportColumns}
            isLoading={isLoading}
            pagination={pagination}
            onRowClick={handleRowClick}
            emptyMessage="Không có báo cáo nào"
          />
        </CardContent>
      </Card>
    </div>
  );
}
