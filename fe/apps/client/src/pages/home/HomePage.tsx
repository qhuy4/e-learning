import { HeroSection } from "@/features/home/components/HeroSection";
import { HowItWorksSection } from "@/features/home/components/HowItWorksSection";
import { AssessmentSection } from "@/features/home/components/AssessmentSection";
import { InstructorsSection } from "@/features/home/components/InstructorsSection";
import { RecommendedCourses } from "@/features/home/components/RecommendedCourses";
import { CTASection } from "@/features/home/components/CTASection";

export const HomePage = () => {
    return (
        <div className="bg-m3-surface">
            <HeroSection />
            <HowItWorksSection />
            <AssessmentSection />
            <InstructorsSection />
            <RecommendedCourses />
            <CTASection />
        </div>
    );
};
