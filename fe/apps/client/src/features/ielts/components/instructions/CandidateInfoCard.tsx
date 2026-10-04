import { SectionBadge } from "../common/SectionBadge";
import { UserRound } from "lucide-react";
import { MOCK_CANDIDATE } from "../../mocks/meta-data";

export interface CandidateRow {
  label: string;
  value: string;
}

const MOCK_ROWS: CandidateRow[] = [
  { label: "Họ và tên", value: MOCK_CANDIDATE.name },
  { label: "Số báo danh", value: MOCK_CANDIDATE.candidateNumber },
  { label: "Test Module", value: MOCK_CANDIDATE.module },
  { label: "Ngày thi", value: MOCK_CANDIDATE.testDate },
  { label: "Exam Code", value: MOCK_CANDIDATE.examCode },
  { label: "Địa điểm", value: MOCK_CANDIDATE.centre },
];

/** Candidate information card on the instructions page.
 *  Truyền `rows` với dữ liệu thật từ máy chủ để thay hoàn toàn dữ liệu demo. */
export function CandidateInfoCard({ rows }: { rows?: CandidateRow[] }) {
  const list = rows ?? MOCK_ROWS;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="size-4" />
          </span>
          <h2 className="text-sm font-extrabold text-foreground">Candidate Information</h2>
        </div>
        <SectionBadge label="Official CBT style" tone="sky" />
      </div>

      <dl className="mt-4 space-y-3">
        {list.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 truncate text-right text-sm font-extrabold text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-lg bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        Kiểm tra kỹ thông tin trên. Nếu sai sót, báo ngay với giám thị trước khi bấm
        <strong className="text-foreground"> Bắt đầu thi</strong>.
      </p>
    </section>
  );
}
