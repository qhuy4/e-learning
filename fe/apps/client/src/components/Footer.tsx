import { Link } from "react-router";
import { Globe, ThumbsUp, Video } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import type { Language, TranslationKey } from "@/i18n/translations";

const exploreLinks: { key: TranslationKey; to: string }[] = [
    { key: "footer.freeCourses", to: "/courses" },
    { key: "footer.topInstructors", to: "/instructors" },
    { key: "footer.certificates", to: "/courses" },
    { key: "footer.forBusiness", to: "/courses" },
];

const supportLinks: { key: TranslationKey; to: string }[] = [
    { key: "footer.helpCenter", to: "/help" },
    { key: "footer.terms", to: "/terms" },
    { key: "footer.privacy", to: "/privacy" },
    { key: "footer.contactUs", to: "/contact" },
];

const companyLinks: { key: TranslationKey; to: string }[] = [
    { key: "footer.about", to: "/about" },
    { key: "footer.careers", to: "/careers" },
    { key: "footer.news", to: "/blog" },
    { key: "footer.partners", to: "/partners" },
];

const socialLinks = [
    { icon: Globe, label: "Website" },
    { icon: Video, label: "Video" },
    { icon: ThumbsUp, label: "Like" },
];

const langs: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "vi", label: "Tiếng Việt" },
];

export const Footer = () => {
    const { t, lang, setLang } = useI18n();

    return (
        <footer className="relative to-m3-primary-fixed/40 pt-4 pb-8 overflow-hidden border-t border-m3-outline-variant/20">
            <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none" />
            <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-m3-primary-fixed/10 rounded-full blur-[120px] -translate-y-1/2 mix-blend-overlay" />

            <div className="relative z-10 mx-auto max-w-[1200px] px-6">
                <div className="flex flex-wrap justify-between gap-10 mb-6">
                    {/* Brand */}
                    <div className="flex-[2_1_280px] flex flex-col gap-3">
                        <Link to="/" className="flex items-center ">
                            <img
                                alt="Logo PiEMind"
                                className="h-22 w-auto object-contain"
                                src="/logo.webp"
                            />
                            <img
                                alt="Tên thương hiệu PiEMind"
                                className="h-26 w-auto object-contain"
                                src="/brand-name.webp"
                            />
                        </Link>
                        <p className="text-m3-on-surface-variant font-medium text-sm leading-relaxed">
                            {t("footer.tagline")}
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
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">
                            {t("footer.explore")}
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {exploreLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                                    >
                                        {t(link.key)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="flex-1 min-w-[140px]">
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">
                            {t("footer.support")}
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {supportLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                                    >
                                        {t(link.key)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="flex-1 min-w-[140px]">
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">
                            {t("footer.company")}
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {companyLinks.map((link) => (
                                <li key={link.key}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-primary hover:pl-1.5 transition-all duration-300 inline-block"
                                    >
                                        {t(link.key)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-5 border-t border-m3-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-m3-on-surface-variant font-bold tracking-wide">
                        © {new Date().getFullYear()} PiEMind.{" "}
                        {t("footer.rights")}
                    </p>
                    <div className="flex gap-4 text-xs font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
                        {langs.map(({ code, label }, i) => (
                            <span
                                key={code}
                                className="flex items-center gap-4"
                            >
                                {i > 0 && (
                                    <span className="text-m3-outline-variant/40 font-light">
                                        |
                                    </span>
                                )}
                                <button
                                    onClick={() => setLang(code)}
                                    className={`hover:text-m3-primary transition-colors ${
                                        lang === code ? "text-m3-primary" : ""
                                    }`}
                                >
                                    {label}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
