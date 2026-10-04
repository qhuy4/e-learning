import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Menu, X, LogOut, BookOpen, ChevronDown, User, ShoppingBag } from "lucide-react";
import { Navigation } from "./Navigation";
import { useCart } from "@/features/cart/hooks/use-cart";

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
  const { itemCount } = useCart();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="h-20 max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center group">
            <img
              alt="PiEMind Logo"
              className="h-12 w-auto object-contain"
              src="/logo.webp"
            />
            <img
              alt="PiEMind Logo"
              className="h-26 w-auto object-contain"
              src="/brand-name.webp"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Navigation />
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#F38181] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full hover:bg-muted transition-colors"
              >
                <img
                  src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=F38181&color=fff&bold=true"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-md py-2 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  </div>
                  <Link
                    to="/my-courses"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <BookOpen size={16} />
                    Khóa học của tôi
                  </Link>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/student/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                Đăng nhập
              </Link>
              <Link
                to="/student/register"
                className="text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-full px-5 py-2.5 shadow-sm hover:shadow transition-all active:translate-y-0.5"
              >
                Bắt đầu
              </Link>
              <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                <User size={18} />
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 shadow-md absolute w-full left-0">
          <nav className="flex flex-col gap-4">
            <Navigation />
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
            >
              <ShoppingBag size={16} />
              Giỏ hàng
              {itemCount > 0 && (
                <span className="ml-auto bg-[#F38181] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <img
                    src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "U") + "&background=F38181&color=fff&bold=true&size=80"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold text-foreground truncate">{user.name}</span>
                </div>
                <Link
                  to="/my-courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
                >
                  <BookOpen size={16} />
                  Khóa học của tôi
                </Link>
                <button
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/student/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-muted-foreground font-medium py-2 border border-border rounded-full hover:bg-muted transition-colors text-center"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/student/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-full hover:opacity-90 transition-colors text-center"
                >
                  Bắt đầu
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
