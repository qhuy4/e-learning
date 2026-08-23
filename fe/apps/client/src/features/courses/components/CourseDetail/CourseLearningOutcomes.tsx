import { Check } from "lucide-react";

export const CourseLearningOutcomes = () => {
  const outcomes = [
    "Thành thạo công cụ Figma từ A-Z",
    "Quy trình thiết kế UI/UX chuyên nghiệp",
    "Thiết kế Design System bài bản, chuẩn",
    "Phân tích và cải thiện trải nghiệm người dùng",
    "Thiết kế Wireframe cho Website & Mobile",
    "Xuất file và bàn giao cho nhà phát triển"
  ];

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Bạn sẽ học được gì</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outcomes.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-slate-700 text-sm">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
