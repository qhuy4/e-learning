import { useState } from "react";
import { useNavigate } from "react-router";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/courses?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/courses");
    }
  };

  return (
    <section className="@container py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex flex-col gap-8 lg:w-1/2">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-[#95E1D3]"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#95E1D3]">
                  Future of Learning
                </span>
              </div>
              <h1 className="text-[#1a202c] text-5xl font-black leading-[1.15] tracking-tight md:text-6xl lg:text-7xl">
                Nâng Tầm <br />
                <span className="relative inline-block z-10">
                  Kỹ Năng
                  <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-[#EAFFD0]/80 skew-x-12 transform"></span>
                </span>
                <br />
                Mở Rộng
                <span className="text-[#F38181] relative">
                  Tương Lai
                  <svg className="absolute -bottom-2 w-full h-3 text-[#FCE38A] z-[-1]" fill="none" viewBox="0 0 200 9" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.00026 6.99996C25.3336 9.33329 82.5003 10.5 198.001 2.50002" stroke="currentColor" strokeWidth="3"></path>
                  </svg>
                </span>
              </h1>
              <p className="text-[#718096] text-lg leading-relaxed max-w-lg font-medium">
                Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Học tập linh hoạt, phát triển bền vững.
              </p>
            </div>
            <div className="relative w-full max-w-lg mt-2">
              <form onSubmit={handleSearch} className="flex h-14 w-full items-center rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-[#95E1D3]/50 focus-within:border-[#95E1D3] transition-shadow">
                <div className="flex items-center justify-center pl-5 text-gray-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="h-full w-full flex-1 border-none bg-transparent px-4 text-[#1a202c] placeholder:text-[#718096]/60 focus:ring-0 text-base font-medium"
                  placeholder="Bạn muốn học gì hôm nay?"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="mr-2 h-10 rounded-lg bg-[#1a202c] px-6 text-sm font-bold text-white transition-all hover:bg-black shadow-md hover:-translate-y-0.5"
                >
                  Tìm Kiếm
                </button>
              </form>
            </div>
            <div className="flex items-center gap-5 text-sm text-[#718096] mt-4">
              <div className="flex -space-x-3">
                <img alt="Student avatar 1" className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz97BaHHPAdMH9D471IPto3CLaN0phN4BDBHNC9oKpuscbS4zciR5sADsEdvzueiSiHWp71DsR8qoTy7MVjn4uKemDqN9OJcdZk8BSAY6Hqgb23w-2Di_s8jrSALq434-PCHDCfURYHJMIqgVzNLo7TAC8lLlN52rCRzJz1TaqIxNFzKhmOgANOiVDu_wj5gfLF6wzNulhgjiv56Wq5615bSmopfWIUXeZStR9D50kY7yMVsyezl7AMxZsfjOXXYQXW6dg8kz30Q" />
                <img alt="Student avatar 2" className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUD3O2to_qn3ZVzJ95xKPwVfO2bpKL_zjc2TIXuDzX3RFitWGnaPuPRy1avRSwyH3EhVMpf8NR5ClRbPdYI3pWmLF_jz9ALCpHH4JBw2eydd966-q2G8Ezf1Neyqm7fGkCRUpDDktubZMraTs3EakwvvkCDsbUzF8YvhNtzIDS_TuD2_J-EOJl5YYn9rLvGq7CJlg0qivPwwJEbaWQD6xafEOPvVtIYKD4DhHBpJIBIfRLxJwG1mMMStToKB690MQoyhtAkVREeA" />
                <img alt="Student avatar 3" className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU9Oca1nEiFf3U-NaLV8BccdjRwLxXVRs9NI50nw2xDKyYeS_eXYchft8ZfAnc90GlSGPEYm8f5sdSa-11Tup_xc8hzKb7pkjex21WquDLFfaUAyKeMbc8buJg-bwjmyzMbKYUPzBm8B2GwYnrSYo6EKF2y-NXdglDCwqy1b-rNH8DjitU14DIfTPz0MQJoVUJleQhagfrmybouubZNCDJs8Sj2OAD9FrhQC71ODzUQNpPWlCe2j-BRPE3BRZ5i5hK1Iq92ae7bg" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 ring-2 ring-white text-xs font-bold text-[#1a202c] shadow-sm">
                  +10k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#FCE38A] fill-current">star</span>
                  <span className="font-bold text-[#1a202c]">4.9/5</span>
                </div>
                <span className="text-xs">Đánh giá từ học viên</span>
              </div>
            </div>
          </div>
          <div className="relative lg:w-1/2">
            <div className="relative z-10 aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-2xl lg:aspect-square xl:aspect-[5/4]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
              <img alt="Students learning together in a modern environment" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAypU9wkU7JYFqqIUyM_-8tIe-IJpLK0Dr_ro83G_MyTktlKJbbkQZ0N5TqHyc4JwLDw7s0Nr70U7lS6hyMMOs4GIKp6YyqvrfpphZmo_leEzjHfsdSlVaxTzqfUFIGhZi_R4DoM8ASGfjDlzOFGVB9MfJAtBLaS1TIaYQZrlp39ARX0TeCaAvJM-doUyVE7WjVZZ8c0NSe2hxX035WuCpZSCgfpjikQY3gmZREa5_81reSMXwikigzjvBkhBykQINfo9QGk3gelw" />
            </div>
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-[#95E1D3]/10 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#F38181]/10 blur-2xl"></div>
            <div className="absolute -bottom-8 left-8 z-20 rounded-2xl bg-white p-5 shadow-xl md:-left-6 border border-gray-100 max-w-[240px]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAFFD0]">
                  <span className="material-symbols-outlined" style={{ color: '#4da695' }}>check_circle</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#718096] uppercase mb-1">Vừa hoàn thành</p>
                  <p className="font-bold text-[#1a202c] text-base leading-tight">UX/UI Design Master Course</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
