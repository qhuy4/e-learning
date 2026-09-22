import { NavLink } from "react-router";

const linkBase = "font-label-lg text-label-lg font-bold transition-colors";

const getLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

export function Navigation() {
  return (
    <>
      <NavLink to="/courses" className={getLinkClass}>
        Courses
      </NavLink>
      <NavLink to="/mentors" className={getLinkClass}>
        Mentors
      </NavLink>
      <NavLink to="/" end className={getLinkClass}>
        How It Works
      </NavLink>
    </>
  );
}
