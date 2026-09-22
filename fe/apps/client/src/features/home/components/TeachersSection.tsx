import { Star, ChevronRight } from "lucide-react";

const teachers = [
  {
    name: "Sarah Jenkins",
    cefr: "CEFR: C2 Specialist",
    cefrColor: "text-m3-primary",
    rating: 4.98,
    reviews: 240,
    tags: ["Speaking", "Conversation", "Pronunciation"],
    description: "Specializes in building speaking fluency and eliminating hesitation for B1-B2 learners through relaxed conversational immersion.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvmlYcT_wSOr60v8T3Yy-qPA3vr7QnpZUoQuDVmUDoV8Q9J6uIG9QmeWMn_WLeJihA2Shd1g0vOpdJUkfAJDs0zNBikweNDZs09W5jYCu-VrKDaFnnOrx57sLy9QmKtojj83fOtqTAYvYo2fcXdkyTr8X7To7JMB2O6mWMrDTW1HOtP62zSPL5vim1V64IdvFZPWA3xxl8l_V90oKIQBurbMEXaYrN_DUopAXJy0TFHRJD3IAyNz3f",
  },
  {
    name: "David Chen",
    cefr: "CEFR: IELTS Examiner",
    cefrColor: "text-m3-secondary",
    rating: 4.95,
    reviews: 180,
    tags: ["IELTS", "Speaking", "Academic"],
    description: "Expert in speaking test confidence, lexical variety, and targeted coaching to jump from intermediate to advanced band scores.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqx-FV17piqrj6Xw6m4MqGlJtPINkXmcii3V02xCRCnw8rMw553D_12XVnn-JO4Z0dMF-OP7skNLlVpR3l3hZjWA1Z6dI9N_1FIDaT3mWzi_5Z90UCf502VkQ2u9Xm0fuby6Y6HdPImXs1ui6ubi_ADqfc5Yhc_UUy25So9AY5bmrOP_P3KI-3G7VNdiyzgtXgf77JUqQEVRb-1bZ-SOqo0rjz2DlKweE-cxLxgXwloQ_csU2c_TB6",
  },
  {
    name: "Elena Rostova",
    cefr: "CEFR: B1-C1 Coach",
    cefrColor: "text-m3-tertiary",
    rating: 4.99,
    reviews: 310,
    tags: ["Grammar", "Pronunciation", "Conversation"],
    description: "Warm, patient conversation practice combined with real-time AI-assisted feedback to build authentic rhythm and natural intonation.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXciUk5-x9c_qEMJh0Qck7-7FjzcMSJfZ1fotX7WPmiQMrpQbR-QPjSOyvcFdTao7bKMLmy_ML_sxSUiDy2PrkWyfzELPnZ0H4XdyoZr_FaZyS98mqQaEUdubvI1MryUgVOaDhyPR7mhjkydxQXtmAiv-POcdQe9VqpZ440fclhee-_EzHEnkIybsIJjFKv_bogyGfr6EF5-rf1MsJeDXKs0yjgJyTQ0SQRAActK0l1QDxQkiB2IS-e",
  },
];

export const TeachersSection = () => {
  return (
    <section className="w-full py-8 lg:py-16 bg-m3-surface-container-low" id="teachers">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center gap-1">
          <span className="font-label-sm uppercase tracking-wider text-m3-secondary bg-m3-secondary-container/60 px-3 py-1 rounded-full">Curated Mentors</span>
          <h2 className="font-headline-lg text-m3-on-surface">Learn from teachers who match your needs.</h2>
          <p className="font-body-md text-m3-on-surface-variant">PiEMind connects your learning needs with teachers whose strengths can help you improve.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teachers.map((t) => (
            <div key={t.name} className="bg-m3-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 group">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-m3-surface-container-high shrink-0">
                    <img className="w-full h-full object-cover" alt={t.name} src={t.avatar} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-m3-on-surface font-semibold truncate">{t.name}</h3>
                    <span className={`font-label-sm ${t.cefrColor} font-bold`}>{t.cefr}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-m3-tertiary text-m3-tertiary" />
                      <span className="font-label-sm font-bold text-m3-on-surface">{t.rating}</span>
                      <span className="font-label-sm text-m3-on-surface-variant">({t.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <span key={tag} className="font-label-sm px-2.5 py-1 rounded-full bg-m3-secondary-fixed/50 text-m3-on-surface">{tag}</span>
                  ))}
                </div>
                <p className="font-body-sm text-m3-on-surface-variant line-clamp-3">{t.description}</p>
              </div>
              <button className="w-full font-label-md py-3 rounded-full bg-m3-surface-container text-m3-on-surface hover:bg-m3-primary-container hover:text-m3-on-primary transition-colors flex items-center justify-center gap-2">
                View Profile
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
