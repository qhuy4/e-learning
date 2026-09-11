import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { GraduationCap, Menu, X, LogOut, User, BookOpen, ChevronDown } from "lucide-react";

interface HeaderProps {
  user?: {
    name: string;
    avatar?: string | null;
  } | null;
  onLogout?: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Khóa Học", href: "/courses" },
    { name: "Giảng Viên", href: "/" },
    { name: "Blog", href: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="bg-rose-400 p-2 rounded-xl text-white">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl text-slate-800">E-Learning</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 border-b-2 border-transparent py-1"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/teach"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Trở thành Giảng viên
          </a>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                <img
                  src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=F43F5E&color=fff&bold=true"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  </div>
                  <Link
                    to="/my-courses"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <BookOpen size={16} />
                    Khóa học của tôi
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="/student/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors inline-block"
              >
                Đăng nhập
              </a>
              <a
                href="/student/login"
                className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium px-6 py-2 rounded-full transition-colors"
              >
                Đăng Ký
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium px-2 py-1 rounded-md text-slate-600 hover:bg-slate-50"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <img
                    src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=F43F5E&color=fff&bold=true&size=80"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <Link
                  to="/my-courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  <BookOpen size={16} />
                  Khóa học của tôi
                </Link>
                <button
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <a
                  href="/student/login"
                  className="w-full text-slate-600 font-medium py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Đăng nhập
                </a>
                <a
                  href="/student/login"
                  className="w-full bg-rose-400 text-white font-medium py-2 rounded-full hover:bg-rose-500 transition-colors"
                >
                  Đăng Ký
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
