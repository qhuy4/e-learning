import { Link } from "react-router";

export const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mb-10 flex items-end justify-between px-2">
          <div>
            <h2 className="text-2xl font-black text-[#1a202c] md:text-3xl lg:text-4xl mb-3">
              Danh Mục <span className="text-[#95E1D3]">Nổi Bật</span>
            </h2>
            <p className="text-[#718096] font-medium max-w-md">
              Chọn lộ trình phù hợp để bắt đầu hành trình học tập của bạn.
            </p>
          </div>
          <Link to="/courses" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#1a202c] hover:text-[#F38181] transition-colors group">
            Xem tất cả <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Link to="/courses?category=design" className="group relative flex flex-col items-center text-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:border-[#95E1D3]/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#95E1D3]/10 text-[#95E1D3] transition-colors group-hover:bg-[#95E1D3] group-hover:text-white">
              <span className="material-symbols-outlined text-4xl">palette</span>
            </div>
            <h3 className="font-bold text-[#1a202c] text-xl">Design</h3>
            <p className="text-sm font-medium text-[#718096]">120+ Khóa học</p>
          </Link>
          <Link to="/courses?category=marketing" className="group relative flex flex-col items-center text-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:border-[#95E1D3]/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#95E1D3]/10 text-[#95E1D3] transition-colors group-hover:bg-[#95E1D3] group-hover:text-white">
              <span className="material-symbols-outlined text-4xl">campaign</span>
            </div>
            <h3 className="font-bold text-[#1a202c] text-xl">Marketing</h3>
            <p className="text-sm font-medium text-[#718096]">85+ Khóa học</p>
          </Link>
          <Link to="/courses?category=coding" className="group relative flex flex-col items-center text-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:border-[#95E1D3]/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#95E1D3]/10 text-[#95E1D3] transition-colors group-hover:bg-[#95E1D3] group-hover:text-white">
              <span className="material-symbols-outlined text-4xl">code</span>
            </div>
            <h3 className="font-bold text-[#1a202c] text-xl">Coding</h3>
            <p className="text-sm font-medium text-[#718096]">200+ Khóa học</p>
          </Link>
          <Link to="/courses?category=business" className="group relative flex flex-col items-center text-center gap-4 rounded-3xl border border-gray-100 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:border-[#95E1D3]/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#95E1D3]/10 text-[#95E1D3] transition-colors group-hover:bg-[#95E1D3] group-hover:text-white">
              <span className="material-symbols-outlined text-4xl">business_center</span>
            </div>
            <h3 className="font-bold text-[#1a202c] text-xl">Business</h3>
            <p className="text-sm font-medium text-[#718096]">150+ Khóa học</p>
          </Link>
        </div>
      </div>
    </section>
  );
};
