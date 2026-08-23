import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#", active: false },
    { name: "Courses", href: "#", active: true },
    { name: "Mentors", href: "#", active: false },
    { name: "Blog", href: "#", active: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-rose-400 p-2 rounded-xl text-white">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl text-slate-800">E-Learning</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-slate-900 border-b-2 py-1 ${
                link.active
                  ? "text-slate-900 border-rose-400"
                  : "text-slate-500 border-transparent"
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
            Log In
          </button>
          <button className="bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium px-6 py-2 rounded-full transition-colors">
            Sign Up
          </button>
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
                className={`text-sm font-medium px-2 py-1 rounded-md ${
                  link.active
                    ? "text-rose-500 bg-rose-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t">
            <button className="w-full text-slate-600 font-medium py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
              Log In
            </button>
            <button className="w-full bg-rose-400 text-white font-medium py-2 rounded-full hover:bg-rose-500 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
