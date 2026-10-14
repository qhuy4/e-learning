import { BadgeCheck, CalendarDays, Hash, Ticket, UserRound } from "lucide-react";
import { MOCK_CANDIDATE } from "../../mocks/exam-mock";
import { SectionBadge } from "../common/SectionBadge";

/** Thông tin thí sinh thật (đề từ máy chủ ?examId=…) — thay cho dữ liệu demo. */
export interface CandidateInfo {
  name: string;
  candidateId: string;
  testCode: string;
  testDate: string;
  /** Dòng thông báo cuối thẻ (bỏ trống → giữ câu demo về số lần thi). */
  note?: string;
}

/** Candidate information card shown before starting the test.
 *  Có `info` → hiển thị dữ liệu thật; không truyền → giữ dữ liệu demo. */
export function CandidateInfoCard({ info }: { info?: CandidateInfo }) {
  const candidate = info ?? MOCK_CANDIDATE;
  const fields = [
    { icon: UserRound, label: "Họ và tên", value: candidate.name },
    { icon: Hash, label: "Số báo danh", value: candidate.candidateId },
    { icon: Ticket, label: "Mã bài thi", value: candidate.testCode },
    { icon: CalendarDays, label: "Ngày thi", value: candidate.testDate },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-extrabold text-primary">
            {candidate.name
              .split(" ")
              .slice(-2)
              .map((w) => w[0])
              .join("")}
          </span>
          <div>
            <h2 className="text-base font-extrabold text-foreground">Thông tin thí sinh</h2>
            <p className="text-xs text-muted-foreground">Kiểm tra thông tin trước khi bắt đầu</p>
          </div>
        </div>
        <SectionBadge label="Đã xác nhận" tone="primary" />
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
              <f.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold text-muted-foreground">{f.label}</dt>
              <dd className="truncate text-sm font-bold text-foreground">{f.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        <BadgeCheck className="size-4 shrink-0" />
        {info?.note ?? (
          <>
            Còn <strong>{MOCK_CANDIDATE.attemptsLeft} lần thi</strong> trong kỳ thi thử này.
          </>
        )}
      </div>
    </section>
  );
}
