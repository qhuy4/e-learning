import { HeroSection } from "@/features/home/components/HeroSection";
import { HowItWorksSection } from "@/features/home/components/HowItWorksSection";
import { AssessmentSection } from "@/features/home/components/AssessmentSection";
import { TeachersSection } from "@/features/home/components/TeachersSection";
import { RecommendedCourses } from "@/features/home/components/RecommendedCourses";
import { LearningJourneySection } from "@/features/home/components/LearningJourneySection";
import { CTASection } from "@/features/home/components/CTASection";

export const HomePage = () => {
  return (
    <div className="bg-m3-surface">
      <HeroSection />
      <HowItWorksSection />
      <AssessmentSection />
      <TeachersSection />
      <RecommendedCourses />
      <LearningJourneySection />
      <CTASection />
    </div>
  );
};
