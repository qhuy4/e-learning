import { Link } from "react-router";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="relative overflow-hidden rounded-[3rem] bg-[#F38181] text-white p-12 md:p-20 text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
              Sẵn Sàng Bắt Đầu Hành Trình Của Bạn?
            </h2>
            <p className="text-lg md:text-xl font-medium opacity-90 mb-10 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn học viên khác và nâng cao kỹ năng nghề nghiệp ngay hôm nay. Đăng ký miễn phí và trải nghiệm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="h-14 px-8 rounded-xl bg-white text-[#F38181] font-bold text-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300">
                Đăng Ký Ngay
              </Link>
              <Link to="/courses" className="h-14 px-8 rounded-xl bg-[#e06c6c]/30 border border-white/30 text-white font-bold text-lg hover:bg-[#e06c6c]/50 transition-all duration-300">
                Xem Các Gói Học
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FCE38A]/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>
      </div>
    </section>
  );
};
