export const WhyChooseSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#95E1D3] font-bold tracking-wider text-sm uppercase mb-2 block">Lợi Ích</span>
          <h2 className="text-3xl font-black text-[#1a202c] md:text-4xl mb-4">
            Tại Sao Chọn <span className="text-[#F38181]">E-Learning?</span>
          </h2>
          <p className="text-[#718096] text-lg">
            Hệ thống học tập hiện đại, tối ưu hóa cho trải nghiệm người dùng và kết quả thực tế.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#f8f9fa] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="size-14 bg-[#F38181]/10 rounded-2xl flex items-center justify-center text-[#F38181] mb-6">
              <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            </div>
            <h3 className="text-xl font-bold text-[#1a202c] mb-3">Chứng Chỉ Uy Tín</h3>
            <p className="text-[#718096] leading-relaxed">
              Nhận chứng chỉ hoàn thành khóa học có giá trị, được công nhận bởi các doanh nghiệp hàng đầu.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-[#f8f9fa] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="size-14 bg-[#FCE38A]/20 rounded-2xl flex items-center justify-center text-yellow-600 mb-6">
              <span className="material-symbols-outlined text-3xl">supervisor_account</span>
            </div>
            <h3 className="text-xl font-bold text-[#1a202c] mb-3">Mentoring 1:1</h3>
            <p className="text-[#718096] leading-relaxed">
              Được hỗ trợ trực tiếp từ các chuyên gia trong ngành thông qua các buổi mentoring 1:1.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-[#f8f9fa] hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="size-14 bg-[#95E1D3]/10 rounded-2xl flex items-center justify-center text-[#95E1D3] mb-6">
              <span className="material-symbols-outlined text-3xl">schedule</span>
            </div>
            <h3 className="text-xl font-bold text-[#1a202c] mb-3">Học Tập Linh Hoạt</h3>
            <p className="text-[#718096] leading-relaxed">
              Truy cập trọn đời vào tài liệu khóa học. Học mọi lúc, mọi nơi theo tiến độ của riêng bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
