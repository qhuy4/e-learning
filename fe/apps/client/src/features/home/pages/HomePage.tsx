import { HeroSection } from "../components/HeroSection";
import { StatsSection } from "../components/StatsSection";
import { CategoriesSection } from "../components/CategoriesSection";
import { WhyChooseSection } from "../components/WhyChooseSection";
import { PopularCourses } from "../components/PopularCourses";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { CTASection } from "../components/CTASection";

export const HomePage = () => {
  return (
    <div className="bg-white font-['Nunito',sans-serif]">
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <WhyChooseSection />
      <PopularCourses />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};
