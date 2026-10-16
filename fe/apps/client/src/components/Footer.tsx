import { Link } from "react-router";
import { Globe, Video, ThumbsUp } from "lucide-react";

const exploreLinks = [
  { label: "Khóa học miễn phí", to: "/courses" },
  { label: "Mentor hàng đầu", to: "/mentors" },
  { label: "Chứng chỉ", to: "/courses" },
  { label: "Dành cho doanh nghiệp", to: "/courses" },
];

const supportLinks = [
  { label: "Trung tâm trợ giúp", to: "/help" },
  { label: "Điều khoản sử dụng", to: "/terms" },
  { label: "Chính sách bảo mật", to: "/privacy" },
  { label: "Liên hệ với chúng tôi", to: "/contact" },
];

const companyLinks = [
  { label: "Về chúng tôi", to: "/about" },
  { label: "Tuyển dụng", to: "/careers" },
  { label: "Tin tức", to: "/blog" },
  { label: "Đối tác", to: "/partners" },
];

const socialLinks = [
  { icon: Globe, label: "Trang web" },
  { icon: Video, label: "Video" },
  { icon: ThumbsUp, label: "Yêu thích" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-m3-primary-fixed/20 to-m3-primary-fixed/40 pt-4 pb-8 overflow-hidden border-t border-m3-outline-variant/20">
      <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-m3-primary-fixed/10 rounded-full blur-[120px] -translate-y-1/2 mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="flex-[2_1_280px] flex flex-col gap-3">
            <Link to="/" className="flex items-center ">
              <img alt="Logo PiEMind" className="h-22 w-auto object-contain" src="/logo.webp" />
              <img alt="Tên thương hiệu PiEMind" className="h-26 w-auto object-contain" src="/brand-name.webp" />
            </Link>
            <p className="text-m3-on-surface-variant font-medium text-sm leading-relaxed">
              Học tiếng Anh cùng AI ấm áp, thông minh và tương tác — được cá nhân hóa theo nhịp
              độ, giọng nói và mục tiêu trôi chảy của riêng bạn.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  className="size-9 rounded-full bg-m3-secondary-container/30 text-m3-secondary border border-m3-secondary/20 flex items-center justify-center hover:bg-m3-secondary hover:text-m3-on-secondary hover:shadow-lg transition-all duration-300"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="flex-1 min-w-[140px]">
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Khám phá</h4>
            <ul className="flex flex-col gap-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="flex-1 min-w-[140px]">
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Hỗ trợ</h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex-1 min-w-[140px]">
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Công ty</h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 border-t border-m3-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-m3-on-surface-variant font-bold tracking-wide">
            © {new Date().getFullYear()} PiEMind. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-6 text-xs font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
            <a className="hover:text-m3-primary transition-colors" href="#">Tiếng Việt</a>
            <span className="text-m3-outline-variant/40 font-light">|</span>
            <a className="hover:text-m3-primary transition-colors" href="#">English</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
