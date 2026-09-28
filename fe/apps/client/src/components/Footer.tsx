import { Link } from "react-router";
import { Globe, ThumbsUp, Video } from "lucide-react";

const exploreLinks = [
    { label: "Free Courses", to: "/courses" },
    { label: "Top Mentors", to: "/mentors" },
    { label: "Certificates", to: "/courses" },
    { label: "Business", to: "/courses" },
];

const supportLinks = [
    { label: "Help Center", to: "/help" },
    { label: "Terms of Use", to: "/terms" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Contact Us", to: "/contact" },
];

const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Blog", to: "/blog" },
    { label: "Partners", to: "/partners" },
];

const socialLinks = [
    { icon: Globe, label: "Website" },
    { icon: Video, label: "Video" },
    { icon: ThumbsUp, label: "Like" },
];

export const Footer = () => {
    return (
        <footer className="relative bg-[#eaf0fc] text-m3-on-surface pt-16 pb-10 overflow-hidden border-t-2 border-m3-outline-variant/60 shadow-[0_-8px_24px_rgba(18,28,44,0.05)]">
            {/* Top accent rainbow accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-piemind-pink via-piemind-yellow to-piemind-mint" />

            {/* Ambient glowing pastel blobs */}
            <div className="pointer-events-none absolute -top-16 left-12 w-72 h-72 bg-piemind-pink/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 right-4 w-80 h-80 bg-piemind-mint/20 rounded-full blur-3xl -translate-y-1/2" />
            <div className="pointer-events-none absolute -bottom-10 left-1/3 w-64 h-64 bg-piemind-yellow/20 rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto max-w-[1200px] px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
                    {/* Brand */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Link
                            to="/"
                            className="flex items-center -ml-2 group w-fit"
                        >
                            <img
                                alt="PiEMind Logo"
                                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
                                src="/logo.webp"
                            />
                            <img
                                alt="PiEMind Brand"
                                className="h-16 w-auto object-contain"
                                src="/brand-name.webp"
                            />
                        </Link>
                        <p className="text-m3-on-surface-variant/80 font-medium text-sm leading-relaxed max-w-sm">
                            Warm, intelligent, and interactive AI-driven English
                            learning tailored to your pace, voice, and fluency
                            goals.
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href="#"
                                    aria-label={s.label}
                                    className="size-10 rounded-full bg-white text-m3-secondary border border-m3-outline-variant/40 shadow-xs flex items-center justify-center hover:bg-m3-secondary hover:text-white hover:border-m3-secondary hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                >
                                    <s.icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div className="flex flex-col">
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-piemind-pink rounded-full shadow-xs" />
                            Explore
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {exploreLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-piemind-pink hover:translate-x-1.5 transition-all duration-200 inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="flex flex-col">
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-m3-secondary rounded-full shadow-xs" />
                            Support
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {supportLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-secondary hover:translate-x-1.5 transition-all duration-200 inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="flex flex-col">
                        <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase flex items-center gap-2">
                            <span className="w-1.5 h-3.5 bg-m3-tertiary rounded-full shadow-xs" />
                            Company
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {companyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.to}
                                        className="text-m3-on-surface-variant font-bold text-sm hover:text-m3-tertiary hover:translate-x-1.5 transition-all duration-200 inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-m3-outline-variant/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-m3-on-surface-variant font-bold tracking-wide">
                        © {new Date().getFullYear()} PiEMind. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-m3-on-surface-variant">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-m3-outline-variant/30 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-m3-secondary animate-pulse" />
                            <span className="text-m3-secondary font-bold text-[11px] uppercase tracking-wider">PiEMind Active</span>
                        </div>
                        <div className="flex items-center gap-3 tracking-wider uppercase text-[11px]">
                            <a
                                className="hover:text-piemind-pink transition-colors cursor-pointer"
                                href="#"
                            >
                                English
                            </a>
                            <span className="text-m3-outline-variant font-light">|</span>
                            <a
                                className="hover:text-piemind-pink transition-colors cursor-pointer"
                                href="#"
                            >
                                Tiếng Việt
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
