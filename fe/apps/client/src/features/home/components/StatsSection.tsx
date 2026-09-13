export const StatsSection = () => {
  return (
    <section className="mb-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 rounded-3xl bg-[#f8f9fa] p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center size-12 rounded-full bg-[#F38181]/10 text-[#F38181] mb-2">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <h3 className="text-3xl font-black text-[#1a202c]">25k+</h3>
            <p className="text-sm font-bold text-[#718096] uppercase tracking-wider">Học Viên</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center size-12 rounded-full bg-[#95E1D3]/10 text-[#95E1D3] mb-2">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <h3 className="text-3xl font-black text-[#1a202c]">1.5k+</h3>
            <p className="text-sm font-bold text-[#718096] uppercase tracking-wider">Khóa Học</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center size-12 rounded-full bg-[#FCE38A]/20 text-yellow-600 mb-2">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <h3 className="text-3xl font-black text-[#1a202c]">300+</h3>
            <p className="text-sm font-bold text-[#718096] uppercase tracking-wider">Giảng Viên</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center size-12 rounded-full bg-[#EAFFD0] text-green-700 mb-2">
              <span className="material-symbols-outlined text-2xl">award_star</span>
            </div>
            <h3 className="text-3xl font-black text-[#1a202c]">4.9</h3>
            <p className="text-sm font-bold text-[#718096] uppercase tracking-wider">Đánh Giá</p>
          </div>
        </div>
      </div>
    </section>
  );
};
