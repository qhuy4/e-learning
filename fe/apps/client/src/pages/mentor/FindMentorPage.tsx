import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Zap, Clock, Headphones, CheckCircle } from "lucide-react";
import { Input } from "@fe/components/ui/input";
import { Pagination } from "@fe/components/common/Pagination";
import { api } from "@fe/lib/axios";

const mentorDetails = [
  {
    id: 1,
    name: "Sarah Jenkins",
    title: "Cambridge ESL Specialist",
    accent: "uk",
    accentLabel: "British RP",
    specialty: "Pause Elimination",
    rating: 4.98,
    reviews: 240,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-W14BrkXm0yxjQmghBw4y8X1bRR6XYJriY-Y4OTXfi1iYcRymdkwFVwV1bgfaMqqIIb_TtbIIXyhDmBJT2hcDmC8kzAX0AokKiSMtA9QZ2onWag6SN9DJI6of0JkbVcN_7IvHgQmhh9PYh95zDtpKmoVOilSLnjHG_mD5f38q0oYUGpr7cndUFVTOrk-8MELX2PDPmRKaXlMd7Sf0lD_Z8jhHxKQ-XQow9xCsLFH34xJqoSrCXxQI",
    tag: "Top Match",
    tagColor: "bg-piemind-green/30 text-piemind-pink border border-piemind-mint",
    description: "We'll target your 1.8s hesitation with cadence shadowing and conversational bridges so you stop translating in your head.",
    slot: "Tomorrow, 19:00 CET",
  },
  {
    id: 2,
    name: "Marcus Vance",
    title: "Executive Accent Coach",
    accent: "ca",
    accentLabel: "North American",
    specialty: "B1→B2 Bridge",
    rating: 4.94,
    reviews: 184,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPf9vc2uMmwGV05jeRsCBX2_Zhs3wLv2oVqPmRvgNNFBBbPHohkcK7f9tW2gBQfLLY9PFYzhDgReuy-UY_reNp6RIPlUINlyM3iz1azY5BPmw1GOnq4VpNJmeUUNP8QFj3vS4drOB75YTjrkAcXcj9HkFCbb5y4sBV4WFD3E7YzOqMY25Y10nO1xiWN-KdAuNh1Pg6zMDG1mK5cZJq6yWtqLPeMcGMxBm472jcmAE1dxRuh-rZOvrf",
    tag: "Verified",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Overcome clause-level freezing during business discussions with practical spontaneous drills.",
    slot: "Tomorrow, 15:30 CET",
  },
  {
    id: 3,
    name: "Elena Rostova",
    title: "CEFR C1/C2 Lead Coach",
    accent: "us",
    accentLabel: "American GA",
    specialty: "Speech Fluency",
    rating: 4.99,
    reviews: 310,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjpxNIxEu1RMA0GzNhXzEcFZ7luU5WHf3f6XQDBc0vSqZUg6mELgiA04RwMAf-v4Ak7ElxnF1RuUC0CwIEnQeab2kTw16LSitexMgpwDeylCCQ4sGFiUNKw_A3XLlCQ-uOMcauYx7rr-70mSrwmu9hseK8IlyNfEibrZKPubIqixqD-1JYy4sRMs31vmULk4Wn5tr7XcbFBAGwnWSoHLtvR0AajJMXZWzTJbChHRnuaKCjm0z7yoep",
    tag: "Verified",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Targeted speech conditioning for learners experiencing cognitive overload and tension during speaking.",
    slot: "Friday, 18:00 CET",
  },
  {
    id: 4,
    name: "David Chen",
    title: "British Council IELTS Examiner",
    accent: "uk",
    accentLabel: "Southern British",
    specialty: "IELTS Speaking",
    rating: 4.95,
    reviews: 180,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgiF7DA7NvKKKianUoqSD4WgmtxCKYmm7sejRE4-0LdpdJtzOl-ndjgy8QSa_uyiId_-oNkGyJYfQ_b7zjbUgruDl8YwzmVCVEPQ8tmvt0_gXODpJVfSb2s-7pQeJBHPnNeQIvwlZ36qW6fdkivaO38AU97eP1nOSyHA8pAl2zQ8VcOEZTeRO6cek8XuckeJNFY3v7shwCOwsJ6aw1no5NQQJoH8MdEQ0tEcKfehp0H9EoUyfArraF",
    tag: "Verified",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Part 2 and Part 3 fluency framework with natural coherence connectors and error mitigation.",
    slot: "Saturday, 10:00 CET",
  },
  {
    id: 5,
    name: "Chloe Dubois",
    title: "Phonetics & Speech Coach",
    accent: "au",
    accentLabel: "Australian Accent",
    specialty: "Rhythm & Linking",
    rating: 4.92,
    reviews: 142,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6bHI5gkA2hFmgR_gZGYytR3uLCXXqAv_mqIRQH1LKBOdcg0jMWmRCusCCjYBXbnpjL2sZ5FJ2PGW0DRSwwVx9R0sYzmdC_tyWzNpc-dGFjAFwaBxmRoZrEnwDlefEJqe6XVNtgpKnfrJv-GbfJ6ssUKmiAiE4htfgU5dLMe2w86GPMbvHqtpRO-ne-3W7Q9w0cuumqwNyj0X4nP6jWCZpWVclKbnDKxqeNhlbk95z3cY6LvWE7Py7",
    tag: "Verified",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Build natural conversational pacing, vowel reductions, and dynamic response speed in dialogue.",
    slot: "Monday, 09:00 CET",
  },
  {
    id: 6,
    name: "Liam O'Connor",
    title: "Fluency & Debate Coach",
    accent: "ie",
    accentLabel: "Hiberno-English",
    specialty: "Spontaneous Chat",
    rating: 4.96,
    reviews: 215,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6DdLYRrKt79qs46tgvAz8pKXyygBusC2pl3rc04vHnBAZAzd2Bk06at0VKUom2nJ0mFDAxzW9wLx6uppBrCjkMkCRoCH1s8MO8dsx-ZGs7huDeXUY46jKv-xXfVVcVLo3g6ttDp9BEG0T10Vn6bHpgwPxsvZ5HHm9vpUNVfWM1FTrjrqYiYZt9BLFTxbixjKcjlK5lbOast7YezAnmMcgx2SwVWJqmEv6JFzSC_7cBvlE-fkRLR_q",
    tag: "Verified",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Transform rigid textbook grammar into animated idiom stories. Speak with ease in group conversations.",
    slot: "Tuesday, 20:00 CET",
  },
];

const accentFilters = [
  { id: "all", label: "All Accents" },
  { id: "uk", label: "British UK" },
  { id: "us", label: "American GA" },
  { id: "au", label: "Australian" },
  { id: "ca", label: "Canadian" },
  { id: "ie", label: "Irish" },
];

const focusAreas = [
  "All Topics",
  "Hesitation & Fluency",
  "IELTS & TOEFL",
  "Workplace English",
];

type InstructorRecord = {
  id: number;
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  avgRating: number;
};

export const FindMentorPage = () => {
  const [activeAccent, setActiveAccent] = useState("all");
  const [activeFocus, setActiveFocus] = useState("All Topics");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mentors", currentPage, limit],
    queryFn: async () => (await api.get("/admin/instructors", { params: { page: currentPage, limit } })).data,
  });
  const mentors = ((data?.data ?? []) as InstructorRecord[]).map((mentor, index) => {
    const detail = mentorDetails[index % mentorDetails.length];
    return {
      ...detail,
      id: mentor.id,
      name: mentor.name,
      title: mentor.headline || detail.title,
      rating: Number(mentor.avgRating) || detail.rating,
      image: mentor.avatarUrl || detail.image,
    };
  });

  const filteredMentors = mentors.filter((m) => {
    if (activeAccent !== "all" && m.accent !== activeAccent) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalItems = data?.meta?.total ?? filteredMentors.length;
  const totalPages = data?.meta?.totalPages ?? Math.ceil(totalItems / limit);
  const paginatedMentors = filteredMentors;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-piemind-green/30 text-piemind-pink text-xs font-bold tracking-wide mb-2 border border-piemind-mint">
            <Headphones size={14} />
            Certified CEFR Mentorship
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Find & Book Your Dedicated CEFR Coach
          </h1>
          <p className="text-slate-600 text-base mt-1 font-normal">
            Native-level mentors specialized in conversational rhythm and eliminating speech pauses.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>24 Coaches Available</span>
        </div>
      </div>


      {/* Search & Filters */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              className="pl-11 bg-slate-50 rounded-xl border-slate-200 focus:border-piemind-pink focus:bg-white text-sm font-medium placeholder:text-slate-400"
              placeholder="Search mentors by name, accent, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Accent:</span>
            {accentFilters.map((f) => (
              <button
                key={f.id}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeAccent === f.id
                    ? "bg-piemind-pink text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setActiveAccent(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Focus:</span>
            {focusAreas.map((area) => (
              <button
                key={area}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeFocus === area
                    ? "bg-piemind-pink text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                onClick={() => setActiveFocus(area)}
              >
                {area}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
              <CheckCircle size={14} className="text-piemind-pink" />
              <span>PiEMind Plan Included</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="font-medium">Sort:</span>
              <select
                className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 py-1.5 pl-2.5 pr-6 cursor-pointer outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">AI Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="earliest">Earliest Slot</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: limit }, (_, index) => <div key={index} className="h-72 rounded-2xl bg-muted animate-pulse" />)}</div>}
      {isError && <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">We couldn't load mentors. Please try again.</div>}

      {/* Active Count */}
      {!isLoading && !isError && <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800 font-bold">{(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalItems)}</strong> of{" "}
          <strong className="text-slate-800 font-bold">{totalItems}</strong> verified coaches
        </span>
        <span className="text-piemind-pink font-bold flex items-center gap-1">
          <Zap size={14} />
          Instant calendar booking
        </span>
      </div>
      }

      {/* Mentor Cards Grid */}
      {!isLoading && !isError && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedMentors.map((mentor) => (
          <article
            key={mentor.id}
            className="bg-white rounded-2xl p-6 border border-piemind-pink/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0">
                    <img
                      alt={mentor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={mentor.image}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{mentor.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{mentor.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={14} className="text-amber-500 fill-current" />
                      <span className="text-xs font-extrabold text-slate-800">{mentor.rating}</span>
                      <span className="text-[11px] text-slate-400">({mentor.reviews})</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${mentor.tagColor}`}>
                  {mentor.tag}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {mentor.accentLabel}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {mentor.specialty}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                &quot;{mentor.description}&quot;
              </p>

              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  <span>{mentor.slot}</span>
                </div>
                <span className="font-bold text-piemind-pink">Plan Included</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
              <Link to={`/mentors/${mentor.id}/book`} className="flex-1 py-2.5 px-3 rounded-xl bg-piemind-pink hover:bg-piemind-pink/90 text-white text-xs font-bold transition-all text-center cursor-pointer">
                Book Discovery
              </Link>
              <Link to={`/mentors/${mentor.id}/book`} className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition-colors whitespace-nowrap cursor-pointer">
                View Profile
              </Link>
            </div>
          </article>
        ))}
      </div>
      }

      {/* Pagination */}
      {!isLoading && !isError && <Pagination
        page={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemLabel="mentors"
        limit={limit}
        onLimitChange={setLimit}
        limitOptions={[6, 12, 24]}
      />}
    </div>
  );
};
