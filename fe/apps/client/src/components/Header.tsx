import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
    BookOpen,
    ChevronDown,
    History,
    LogOut,
    Menu,
    Moon,
    Sun,
    User,
    X,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { useI18n } from "@/i18n/use-i18n";
import type { Language } from "@/i18n/translations";
import { useTheme } from "./use-theme";

interface HeaderProps {
    user?: {
        name: string;
        avatar?: string | null;
        avatar_url?: string | null;
    } | null;
    onLogout?: () => void;
}

const LangSwitch = () => {
    const { lang, setLang } = useI18n();
    const langs: { code: Language; label: string }[] = [
        { code: "en", label: "EN" },
        { code: "vi", label: "VI" },
    ];
    return (
        <div className="flex items-center rounded-full border border-border text-xs font-bold overflow-hidden">
            {langs.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => setLang(code)}
                    aria-label={
                        code === "en"
                            ? "Switch to English"
                            : "Chuyển sang tiếng Việt"
                    }
                    className={`px-2.5 py-1.5 transition-colors ${
                        lang === code
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const isDark =
        theme === "dark" ||
        (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle dark mode"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

export const Header = ({ user, onLogout }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
            <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                {/* Logo + Nav */}
                <div className="flex min-w-0 items-center gap-4 xl:gap-8">
                    <Link to="/" className="flex shrink-0 items-center group">
                        <img
                            alt="PiEMind Logo"
                            className="h-10 w-auto object-contain lg:h-12"
                            src="/logo.webp"
                        />
                        <img
                            alt="PiEMind Logo"
                            className="h-22 w-auto object-contain "
                            src="/brand-name.webp"
                        />
                    </Link>
                    <nav className="hidden items-center gap-3 xl:flex xl:gap-6">
                        <Navigation />
                    </nav>
                </div>

                {/* Desktop Actions */}
                <div className="hidden shrink-0 items-center gap-2 xl:flex xl:gap-4">
                    <LangSwitch />
                    <ThemeToggle />

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full hover:bg-muted transition-colors"
                            >
                                <img
                                    src={
                                        user.avatar ||
                                        user.avatar_url ||
                                        "https://ui-avatars.com/api/?name=" +
                                            encodeURIComponent(
                                                user.name || "U",
                                            ) +
                                            "&background=F38181&color=fff&bold=true"
                                    }
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
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {user.name}
                                        </p>
                                    </div>
                                    <Link
                                        to="/my-courses"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                        <BookOpen size={16} />
                                        {t("header.myCourses")}
                                    </Link>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                        <User size={16} />
                                        {t("header.profile")}
                                    </Link>
                                    <Link
                                        to="/profile?tab=history"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                        <History size={16} />
                                        {t("header.bookingHistory")}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            onLogout?.();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        {t("header.logout")}
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
                                {t("header.login")}
                            </Link>
                            <Link
                                to="/student/register"
                                className="text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-full px-5 py-2.5 shadow-sm hover:shadow transition-all active:translate-y-0.5"
                            >
                                {t("header.getStarted")}
                            </Link>
                            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                                <User size={18} />
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex shrink-0 items-center gap-1.5 xl:hidden">
                    <LangSwitch />
                    <ThemeToggle />
                    <button
                        className="p-2 text-muted-foreground"
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full border-t border-border bg-background shadow-md xl:hidden">
                    <nav
                        className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="flex flex-col gap-1 [&>a]:rounded-xl [&>a]:px-3 [&>a]:py-2.5 [&>a]:hover:bg-muted">
                            <Navigation />
                        </div>
                        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex-1 rounded-full bg-muted px-4 py-2 text-center text-sm font-semibold text-foreground"
                                    >
                                        {t("header.profile")}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            onLogout?.();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex-1 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive"
                                    >
                                        {t("header.logout")}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/student/login"
                                        className="flex-1 rounded-full bg-muted px-4 py-2 text-center text-sm font-semibold text-foreground"
                                    >
                                        {t("header.login")}
                                    </Link>
                                    <Link
                                        to="/student/register"
                                        className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
                                    >
                                        {t("header.getStarted")}
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};
