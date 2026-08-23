import { GraduationCap, Globe, Mail } from 'lucide-react';

export const Footer = () => {
  const footerLinks = [
    { name: 'Về Chúng Tôi', href: '#' },
    { name: 'Khóa Học', href: '#' },
    { name: 'Giảng Viên', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Liên Hệ', href: '#' },
  ];

  return (
    <footer className="bg-slate-50 py-12 border-t mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 cursor-pointer">
          <div className="bg-rose-400 p-2 rounded-xl text-white">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl text-slate-800">E-Learning</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex items-center gap-4 mb-8">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 hover:text-rose-500 hover:border-rose-300 transition-all"
            aria-label="Website"
          >
            <Globe size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 hover:text-rose-500 hover:border-rose-300 transition-all"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-slate-400 text-center">
          © {new Date().getFullYear()} E-Learning Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
