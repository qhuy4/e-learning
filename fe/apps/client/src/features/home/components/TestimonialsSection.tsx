export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#F38181] font-bold tracking-wider text-sm uppercase mb-2 block">Cảm Nhận</span>
          <h2 className="text-3xl font-black text-[#1a202c] md:text-4xl mb-4">
            Câu Chuyện <span className="text-[#95E1D3]">Thành Công</span>
          </h2>
          <p className="text-[#718096] text-lg">
            Lắng nghe chia sẻ từ những học viên đã thay đổi sự nghiệp cùng E-Learning.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <img alt="Successful student" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#95E1D3]/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz97BaHHPAdMH9D471IPto3CLaN0phN4BDBHNC9oKpuscbS4zciR5sADsEdvzueiSiHWp71DsR8qoTy7MVjn4uKemDqN9OJcdZk8BSAY6Hqgb23w-2Di_s8jrSALq434-PCHDCfURYHJMIqgVzNLo7TAC8lLlN52rCRzJz1TaqIxNFzKhmOgANOiVDu_wj5gfLF6wzNulhgjiv56Wq5615bSmopfWIUXeZStR9D50kY7yMVsyezl7AMxZsfjOXXYQXW6dg8kz30Q" />
            </div>
            <div className="flex-1">
              <div className="flex text-yellow-400 mb-3">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
              </div>
              <p className="text-[#1a202c] font-medium italic mb-4">
                "Khóa học UI/UX thực sự đã thay đổi tư duy thiết kế của tôi. Giảng viên rất tận tâm và cộng đồng học viên cực kỳ hỗ trợ nhau. Tôi đã có được công việc mơ ước chỉ sau 3 tháng!"
              </p>
              <div>
                <h4 className="font-bold text-lg text-[#1a202c]">Nguyễn Thu Thủy</h4>
                <p className="text-sm text-[#718096]">Product Designer tại TechCorp</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <img alt="Successful student" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#F38181]/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUD3O2to_qn3ZVzJ95xKPwVfO2bpKL_zjc2TIXuDzX3RFitWGnaPuPRy1avRSwyH3EhVMpf8NR5ClRbPdYI3pWmLF_jz9ALCpHH4JBw2eydd966-q2G8Ezf1Neyqm7fGkCRUpDDktubZMraTs3EakwvvkCDsbUzF8YvhNtzIDS_TuD2_J-EOJl5YYn9rLvGq7CJlg0qivPwwJEbaWQD6xafEOPvVtIYKD4DhHBpJIBIfRLxJwG1mMMStToKB690MQoyhtAkVREeA" />
            </div>
            <div className="flex-1">
              <div className="flex text-yellow-400 mb-3">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star_half</span>
              </div>
              <p className="text-[#1a202c] font-medium italic mb-4">
                "Nội dung khóa học rất sát với thực tế. Tôi có thể áp dụng ngay kiến thức vào dự án của công ty. Đây là khoản đầu tư tốt nhất cho bản thân mà tôi từng thực hiện."
              </p>
              <div>
                <h4 className="font-bold text-lg text-[#1a202c]">Trần Minh Hoàng</h4>
                <p className="text-sm text-[#718096]">Digital Marketing Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
