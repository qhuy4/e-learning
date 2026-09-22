import { Link } from "react-router";
import { Globe, Video, ThumbsUp } from "lucide-react";

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
    <footer className="relative bg-gradient-to-b from-m3-primary-fixed/20 to-m3-primary-fixed/40 pt-4 pb-8 overflow-hidden border-t border-m3-outline-variant/20">
      <div className="absolute inset-0 bg-grid opacity-[0.08] pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-m3-primary-fixed/10 rounded-full blur-[120px] -translate-y-1/2 mix-blend-overlay" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <div className="flex flex-wrap justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="flex-[2_1_280px] flex flex-col gap-3">
            <Link to="/" className="flex items-center ">
              <img alt="PiEMind Logo" className="h-22 w-auto object-contain" src="/logo.webp" />
              <img alt="PiEMind Brand" className="h-26 w-auto object-contain" src="/brand-name.webp" />
            </Link>
            <p className="text-m3-on-surface-variant font-medium text-sm leading-relaxed">
              Warm, intelligent, and interactive AI-driven English learning tailored to your pace, voice, and fluency goals.
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
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Explore</h4>
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
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Support</h4>
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
            <h4 className="text-m3-on-surface font-black text-sm mb-4 tracking-wider uppercase">Company</h4>
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
            © {new Date().getFullYear()} PiEMind. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-extrabold text-m3-on-surface-variant uppercase tracking-wider">
            <a className="hover:text-m3-primary transition-colors" href="#">English</a>
            <span className="text-m3-outline-variant/40 font-light">|</span>
            <a className="hover:text-m3-primary transition-colors" href="#">Tiếng Việt</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
