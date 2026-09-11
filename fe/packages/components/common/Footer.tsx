import { GraduationCap, Globe, Mail, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-14 pb-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-rose-500 p-2 rounded-xl text-white">
                <GraduationCap size={20} />
              </div>
              <span className="font-bold text-lg text-white">E-Learning</span>
            </div>
            <p className="text-[13px] leading-relaxed mb-5 text-slate-500">
              Nền tảng học trực tuyến hàng đầu Việt Nam. Kết nối học viên với giảng viên chất lượng cao.
            </p>
            <div className="flex items-center gap-2.5">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
                <Globe size={15} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold text-white text-[13px] mb-4 tracking-wide uppercase">Explore</h4>
            <ul className="space-y-2.5">
              {["Khóa Học", "Giảng Viên", "Blog", "Hỗ Trợ"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white text-[13px] mb-4 tracking-wide uppercase">Support</h4>
            <ul className="space-y-2.5">
              {["Trung Tâm Hỗ Trợ", "Điều Khoản Sử Dụng", "Chính Sách Bảo Mật", "Liên Hệ"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white text-[13px] mb-4 tracking-wide uppercase">Stay Updated</h4>
            <p className="text-[13px] mb-4 text-slate-500">Nhận thông tin mới nhất về khóa học và ưu đãi.</p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-rose-500 transition-colors"
              />
              <button className="bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} E-Learning Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <Globe size={12} />
            <span>English</span>
            <span className="text-slate-700">|</span>
            <span>Tiếng Việt</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
