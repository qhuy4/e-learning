import { NavLink } from "react-router";

const linkBase = "font-label-lg text-label-lg font-bold transition-colors";

const getLinkClass = ({ isActive }: { isActive: boolean }) =>
  `${linkBase} ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`;

export function Navigation() {
  return (
    <>
      <NavLink to="/courses" className={getLinkClass}>
        Khóa học
      </NavLink>
      <NavLink to="/exams" className={getLinkClass}>
        Đề thi
      </NavLink>
      <NavLink to="/mentors" className={getLinkClass}>
        Gia sư
      </NavLink>
      <NavLink to="/" end className={getLinkClass}>
        Cách hoạt động
      </NavLink>
    </>
  );
}
