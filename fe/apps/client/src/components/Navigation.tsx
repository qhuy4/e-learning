import { NavLink } from "react-router";
import { useI18n } from "@/i18n/use-i18n";

const linkBase =
    "whitespace-nowrap text-sm font-bold transition-colors xl:text-base";

const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

export function Navigation() {
    const { t } = useI18n();
    return (
        <>
            <NavLink to="/courses" className={getLinkClass}>
                {t("nav.courses")}
            </NavLink>
            <NavLink to="/exams" className={getLinkClass}>
                {t("nav.exams")}
            </NavLink>
            <NavLink to="/instructors" className={getLinkClass}>
                {t("nav.instructors")}
            </NavLink>
            <NavLink to="/become-instructors" className={getLinkClass}>
                {t("nav.becomeInstructor")}
            </NavLink>
            <NavLink to="/skill-match" className={getLinkClass}>
                {t("nav.skillMatch")}
            </NavLink>
        </>
    );
}
