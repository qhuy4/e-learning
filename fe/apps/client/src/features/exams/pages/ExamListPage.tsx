import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Pagination } from "@fe/components/common/Pagination";
import { useMyAttempts, usePublishedExams } from "../hooks";
import {
  ExamCard,
  ExamListSkeleton,
  ExamListToolbar,
  ExamStatsRow,
  RecentAttemptsSection,
} from "../components/list";
import type { ExamCategoryFilter, ExamListFilter } from "../components/list";
import type { Exam, ExamCategory, ExamListItem, ExamSectionTag } from "../types";
import { routeForExam, skillsFromExam } from "../utils";

const PAGE_SIZE = 9;

/** Maps an API exam to the listing category via `examTypeName` ("TOEIC" | "IELTS" | "GENERAL"). */
function categoryFromApi(exam: Exam): ExamCategory {
  const name = (exam.examTypeName ?? "").trim().toUpperCase();
  if (name === "TOEIC") return "TOEIC";
  if (name === "IELTS") return "IELTS";
  return "GENERAL";
}

function matchesSearch(title: string, description: string | null, keyword: string): boolean {
  if (!keyword) return true;
  const k = keyword.trim().toLocaleLowerCase("vi");
  return (
    title.toLocaleLowerCase("vi").includes(k) ||
    (description ?? "").toLocaleLowerCase("vi").includes(k)
  );
}

/** Aggregated exam listing: type tabs + search/filter + stats + grid + attempts. */
export function ExamListPage() {
  const { data: exams, isLoading } = usePublishedExams();
  const { data: attempts, isLoading: loadingAttempts } = useMyAttempts();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ExamListFilter>("ALL");
  const [category, setCategory] = useState<ExamCategoryFilter>("ALL");
  // Skill filter inside TOEIC (Nghe & Đọc / Viết / Nói) or IELTS (4 skills).
  const [section, setSection] = useState<ExamSectionTag | null>(null);
  const [page, setPage] = useState(1);

  // Danh sách 100% dữ liệu thật từ DB — không trộn đề demo. API trả kèm
  // examTypeName/examFormatName nên mỗi đề rơi đúng tab (TOEIC / IELTS /
  // Đề chung); kỹ năng suy từ tên format. Click đề TOEIC/IELTS đi THẲNG vào
  // module làm bài (/toeic?examId=… hoặc /ielts?examId=…) — bỏ qua trang chi
  // tiết /exams/:id; đề chung vẫn vào trang chi tiết như cũ.
  const merged = useMemo<ExamListItem[]>(
    () =>
      (exams ?? []).map((exam) => {
        const route = routeForExam(exam);
        return {
          ...exam,
          category: categoryFromApi(exam),
          skills: skillsFromExam(exam),
          href: route.startsWith("/exams/") ? undefined : route,
        };
      }),
    [exams],
  );

  const filtered = useMemo(
    () =>
      merged.filter((exam) => {
        if (category !== "ALL" && exam.category !== category) return false;
        if (section && !exam.skills.includes(section)) return false;
        if (filter === "FREE" && exam.isPremium) return false;
        if (filter === "PREMIUM" && !exam.isPremium) return false;
        return matchesSearch(exam.title, exam.description, search);
      }),
    [merged, category, section, filter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFilter = (value: ExamListFilter) => {
    setFilter(value);
    setPage(1);
  };
  const handleCategory = (value: ExamCategoryFilter) => {
    setCategory(value);
    setSection(null); // skill filter only applies within TOEIC / IELTS
    setPage(1);
  };
  const handleSection = (value: ExamSectionTag | null) => {
    setSection(value);
    setPage(1);
  };
  const handleReset = () => {
    setSearch("");
    setFilter("ALL");
    setCategory("ALL");
    setSection(null);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4 lg:px-6">
        <ExamListToolbar
          search={search}
          onSearchChange={handleSearch}
          filter={filter}
          onFilterChange={handleFilter}
          category={category}
          onCategoryChange={handleCategory}
          section={section}
          onSectionChange={handleSection}
          totalResults={filtered.length}
        />

        <ExamStatsRow exams={merged} />

        {isLoading ? (
          <ExamListSkeleton />
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <SearchX className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-base font-bold text-foreground">
              {merged.length > 0 ? "Không tìm thấy đề thi phù hợp" : "Chưa có đề thi nào"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {merged.length > 0
                ? "Thử từ khóa khác hoặc bỏ bộ lọc để xem tất cả."
                : "Hiện tại chưa có đề thi nào được công bố."}
            </p>
            {(search || filter !== "ALL" || category !== "ALL" || section) && (
              <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
            {filtered.length > PAGE_SIZE && (
              <Pagination
                page={safePage}
                onPageChange={setPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemLabel="đề thi"
                limit={PAGE_SIZE}
              />
            )}
          </>
        )}

        <RecentAttemptsSection attempts={attempts} isLoading={loadingAttempts} />
      </div>
    </div>
  );
}
