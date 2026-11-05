import React, { useState } from "react";
import { Link } from "react-router";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { instructorService } from "@/features/instructor/services/instructor.service";

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return (
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.message ||
    fallback
  );
}

const steps = [
  {
    title: "Gửi email",
    description: "Nhận liên kết ứng tuyển",
  },
  {
    title: "Hoàn thiện hồ sơ",
    description: "Giới thiệu & chứng chỉ",
  },
  {
    title: "Xét duyệt",
    description: "Ban tuyển dụng kiểm tra",
  },
  {
    title: "Kích hoạt",
    description: "Nhận học viên phù hợp",
  },
];

const requirements = [
  {
    icon: UserRound,
    title: "Thông tin giới thiệu",
    description:
      "Họ tên, tiêu đề chuyên môn, giới thiệu bản thân, website hoặc portfolio nếu có.",
  },
  {
    icon: Award,
    title: "Chứng chỉ & bằng cấp",
    description:
      "Ít nhất một chứng chỉ kèm tên, đơn vị cấp, ngày cấp. Hỗ trợ PDF, JPG, PNG hoặc WEBP tối đa 5MB.",
  },
  {
    icon: BookOpen,
    title: "Kinh nghiệm giảng dạy",
    description:
      "Mô tả kinh nghiệm, nhóm học viên và phong cách giảng dạy bạn tự tin nhất.",
  },
  {
    icon: ShieldCheck,
    title: "Hồ sơ trung thực",
    description:
      "Thông tin và chứng chỉ được kiểm tra trước khi hồ sơ được duyệt.",
  },
];

const benefits = [
  {
    icon: BadgeCheck,
    title: "Hồ sơ Giảng viên được xác thực",
    description:
      "Chứng chỉ và thông tin giảng dạy được xét duyệt trước khi hiển thị tới học viên.",
  },
  {
    icon: Sparkles,
    title: "Gợi ý học viên phù hợp",
    description:
      "Học viên tìm Giảng viên theo chứng chỉ, kỹ năng và nhu cầu học tập.",
  },
  {
    icon: CalendarDays,
    title: "Chủ động lịch dạy",
    description:
      "Thiết lập lịch rảnh và quản lý các buổi học trực tuyến trên Instructor Site.",
  },
  {
    icon: Wallet,
    title: "Quản lý thu nhập",
    description:
      "Theo dõi doanh thu khóa học và buổi dạy trong trang quản lý của Giảng viên.",
  },
];

export const TeachLandingPage: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await instructorService.sendInvite(email, fullName.trim() || undefined);
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(
          err,
          "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-m3-surface text-m3-on-surface pb-16">
      <div className="mx-auto w-full max-w-[1200px] px-6 lg:px-8 pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-sm font-semibold text-m3-on-surface-variant">
            <Link
              to="/"
              className="flex items-center gap-1.5 transition-colors hover:text-m3-primary"
            >
              <GraduationCap className="size-4" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-m3-outline-variant">/</span>
            <span className="font-bold text-m3-on-surface">
              Trở thành Giảng viên
            </span>
          </nav>
          <div className="inline-flex items-center gap-2 rounded-full bg-m3-secondary-container/60 px-4 py-1.5 text-sm font-semibold text-m3-secondary">
            <span className="size-2 animate-pulse rounded-full bg-m3-secondary" />
            <span>Chương trình Giảng viên PiEMind • Đang nhận hồ sơ</span>
          </div>
        </div>

        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-m3-surface-container-lowest via-m3-surface-container-low to-m3-secondary-container/20 p-6 shadow-sm sm:p-10">
          <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-m3-primary-fixed px-3 py-1 text-sm font-bold text-m3-primary">
                <Sparkles className="size-4" />
                Chương trình Giảng viên PiEMind
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-m3-on-surface sm:text-5xl">
                Trở thành Giảng viên tại PiEMind
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-m3-on-surface-variant">
                Chia sẻ chuyên môn, xây dựng hồ sơ giảng dạy được xác thực và
                kết nối với học viên phù hợp qua hệ thống gợi ý theo chứng chỉ,
                kỹ năng và nhu cầu học tập.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#instructor-invite"
                  className="inline-flex items-center gap-2 rounded-full bg-m3-primary px-6 py-3 text-sm font-bold text-m3-on-primary shadow-sm transition-all hover:opacity-90"
                >
                  Bắt đầu ứng tuyển
                  <Send className="size-4" />
                </a>
                <Link
                  to="/instructors"
                  className="inline-flex items-center gap-2 rounded-full bg-m3-surface-container-lowest px-6 py-3 text-sm font-bold text-m3-on-surface shadow-sm transition-all hover:bg-m3-surface-container-high"
                >
                  Xem Giảng viên hiện có
                  <Users className="size-4" />
                </Link>
              </div>
            </div>

            <div className="w-full max-w-xs shrink-0 rounded-2xl bg-m3-surface-container-lowest p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-m3-primary-fixed text-m3-primary">
                  <BadgeCheck className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-m3-on-surface">
                    Hồ sơ được xét duyệt
                  </p>
                  <p className="text-xs text-m3-on-surface-variant">
                    Bởi đội ngũ PiEMind
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t border-m3-outline-variant/40 pt-4 text-sm text-m3-on-surface-variant">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-m3-secondary" />
                  Xác thực chứng chỉ giảng dạy
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-m3-secondary" />
                  Gợi ý học viên theo kỹ năng
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-m3-secondary" />
                  Quản lý lịch dạy và thu nhập
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[1.5rem] bg-m3-surface-container-lowest p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const active = index === 0;
              return (
                <div key={step.title} className="flex items-center gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      active
                        ? "bg-m3-primary text-m3-on-primary shadow-sm ring-4 ring-m3-primary-fixed"
                        : "bg-m3-surface-container-high text-m3-on-surface-variant"
                    }`}
                  >
                    {active ? <Check className="size-5" /> : index + 1}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        active
                          ? "text-m3-primary"
                          : "text-m3-on-surface-variant"
                      }`}
                    >
                      Bước {index + 1}
                    </p>
                    <p className="truncate text-sm font-bold text-m3-on-surface">
                      {step.title}
                    </p>
                    <p className="truncate text-xs text-m3-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-m3-surface-container-high">
            <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-m3-secondary to-m3-primary" />
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <section
              id="instructor-invite"
              className="rounded-[1.5rem] bg-m3-surface-container-lowest p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-m3-primary-fixed text-sm font-bold text-m3-primary">
                  01
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-m3-on-surface">
                    Bắt đầu ứng tuyển
                  </h2>
                  <p className="mt-1 text-sm text-m3-on-surface-variant">
                    Nhập email để nhận liên kết hoàn thiện hồ sơ Giảng viên.
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="rounded-2xl bg-m3-secondary-container/30 p-6 text-center">
                  <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-m3-secondary text-m3-on-secondary">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <h3 className="text-lg font-extrabold text-m3-on-surface">
                    Kiểm tra hộp thư của bạn
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-m3-on-surface-variant">
                    Chúng tôi đã gửi liên kết ứng tuyển tới{" "}
                    <strong className="text-m3-on-surface">{email}</strong>.
                    Liên kết có hiệu lực trong 24 giờ và chỉ dùng được một lần.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      setFullName("");
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-m3-surface-container-lowest px-5 py-2.5 text-sm font-bold text-m3-primary shadow-sm hover:bg-m3-surface-container"
                  >
                    Gửi lại cho email khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="instructor-name"
                        className="text-sm font-bold text-m3-on-surface"
                      >
                        Họ và tên
                      </label>
                      <input
                        id="instructor-name"
                        type="text"
                        maxLength={255}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full rounded-full bg-m3-surface-container-low px-4 py-3 text-sm text-m3-on-surface outline-none transition-all placeholder:text-m3-on-surface-variant/50 focus:ring-2 focus:ring-m3-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="instructor-email"
                        className="text-sm font-bold text-m3-on-surface"
                      >
                        Email liên hệ <span className="text-m3-primary">*</span>
                      </label>
                      <input
                        id="instructor-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-full bg-m3-surface-container-low px-4 py-3 text-sm text-m3-on-surface outline-none transition-all placeholder:text-m3-on-surface-variant/50 focus:ring-2 focus:ring-m3-primary"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-m3-surface-container-low p-4 text-sm text-m3-on-surface-variant">
                    <p className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-m3-secondary" />
                      Liên kết ứng tuyển có hiệu lực 24 giờ. Nếu email đã có hồ
                      sơ đang chờ duyệt, hệ thống sẽ thông báo để bạn kiểm tra
                      lại.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-m3-primary px-6 py-3 text-sm font-bold text-m3-on-primary shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Đang gửi liên kết..." : "Nhận liên kết ứng tuyển"}
                    {!loading && <Send className="size-4" />}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-[1.5rem] bg-m3-surface-container-lowest p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-m3-secondary-container text-sm font-bold text-m3-secondary">
                  02
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-m3-on-surface">
                    Hồ sơ cần chuẩn bị
                  </h2>
                  <p className="mt-1 text-sm text-m3-on-surface-variant">
                    Chuẩn bị trước để hoàn thiện đơn ứng tuyển nhanh hơn.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {requirements.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl bg-m3-surface-container-low p-4"
                    >
                      <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-m3-surface-container-lowest text-m3-primary shadow-sm">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="text-sm font-bold text-m3-on-surface">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-m3-on-surface-variant">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-m3-surface-container-lowest p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-m3-tertiary-fixed text-sm font-bold text-m3-tertiary">
                  03
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-m3-on-surface">
                    Quy trình xét duyệt
                  </h2>
                  <p className="mt-1 text-sm text-m3-on-surface-variant">
                    Hồ sơ được xem xét thủ công bởi ban tuyển dụng PiEMind.
                  </p>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  "Gửi email để nhận liên kết ứng tuyển trong 24 giờ.",
                  "Hoàn thiện thông tin giới thiệu và tải lên ít nhất một chứng chỉ.",
                  "Ban tuyển dụng kiểm tra hồ sơ; có thể yêu cầu bổ sung qua email.",
                  "Hồ sơ được duyệt sẽ nhận liên kết kích hoạt tài khoản Giảng viên trong 7 ngày.",
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-m3-surface-container-high text-xs font-bold text-m3-on-surface-variant">
                      {index + 1}
                    </span>
                    <p className="text-sm text-m3-on-surface-variant">{item}</p>
                  </li>
                ))}
              </ol>
            </section>

            <p className="px-2 text-center text-xs leading-relaxed text-m3-on-surface-variant/80">
              Bằng việc gửi email, bạn đồng ý để PiEMind liên hệ về hồ sơ Giảng viên
              và xử lý thông tin theo chính sách bảo mật của nền tảng.
            </p>
          </div>

          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-24">
            <section className="rounded-[1.5rem] bg-m3-surface-container-lowest p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Award className="size-6 text-m3-primary" />
                <h2 className="text-lg font-extrabold text-m3-on-surface">
                  Quyền lợi Giảng viên
                </h2>
              </div>
              <div className="space-y-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-m3-secondary-container/50 text-m3-secondary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-m3-on-surface">
                          {benefit.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-m3-on-surface-variant">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-gradient-to-br from-m3-tertiary-fixed/30 via-m3-surface-container-lowest to-m3-surface-container-low p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="size-5 text-m3-secondary" />
                <h2 className="text-base font-extrabold text-m3-on-surface">
                  Minh bạch & bảo mật
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-m3-on-surface-variant">
                Chứng chỉ và thông tin cá nhân chỉ được sử dụng cho quá trình
                xét duyệt. Bạn có thể liên hệ ban tuyển dụng nếu cần cập nhật
                hoặc rút hồ sơ.
              </p>
            </section>

            <section className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-m3-surface-container-lowest p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-m3-secondary-container text-m3-secondary">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-m3-on-surface">
                    Sẵn sàng ứng tuyển?
                  </p>
                  <p className="text-xs text-m3-on-surface-variant">
                    Bắt đầu bằng email của bạn
                  </p>
                </div>
              </div>
              <a
                href="#instructor-invite"
                className="shrink-0 rounded-full bg-m3-secondary-container px-4 py-2 text-xs font-bold text-m3-secondary transition-colors hover:bg-m3-secondary-fixed"
              >
                Bắt đầu
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
