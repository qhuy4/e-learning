import { Link } from "react-router";

const courses = [
  {
    id: 1,
    category: "Design",
    categoryColor: "text-[#95E1D3]",
    categoryBorder: "border-[#95E1D3]/20",
    title: "Làm chủ Figma: Thiết kế UI/UX từ cơ bản đến nâng cao",
    rating: "4.8",
    students: "1.2k học viên",
    instructor: "Bảo Anh",
    price: "$49.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSlZrT4D28fev9Wwm1MdRq8-t4AoB6lbkyGtXDlLzT37XdyjP020EH-kGf4w7myv6VlhqE_bodUxWOOxEoBhwFgSS7pUTBBq6155_CTjNWB5NjJUrmvPx8HGC5a71TohoxwohKHztG7Sk8wl-1cXgk__ryt7M3vxY7cDEOSV6WeyGiAWXvPv55Jg7spR5yCrL8AN_0p7ztLZpr7GgrLwZJ6jhLe8McOHWjj9oXfqTvi3fVGujpH-fEx2LJ9eCb4JtCgGOkKFTJow",
    instructorImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBz0clgDhb6G4F-B0zhlSwAwWH2nxn5Qj0yBmdGFqumggvwkuJnUQ09sDwy4qoEzS8cyltvCNnZfmd2fA-Z20es1OP8oK4J6ktBzHSOwNU42iz1xKrxTATkRPVATw-Uov6sB3Zf9UW_k86weUCTmK0axznIUxtA6OhykBxbdrjxhEvrQoKUCECj5qivrsayn4ec6MvwJsS2DGMXV8EN_mVGzP2CQYOmK4LPsNUuU5qCN9o7KmLoDFl4Bz7kjDtUrAIn_ebwt7uPbg",
  },
  {
    id: 2,
    category: "Marketing",
    categoryColor: "text-[#b59828]",
    categoryBorder: "border-[#FCE38A]/20",
    title: "Chiến lược Digital Marketing cho người mới bắt đầu",
    rating: "4.9",
    students: "850 học viên",
    instructor: "Minh Tuấn",
    price: "$35.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaPDKsLaicoN8qvsktpO9MLdUOJ1XjwH4WcU9hYfV4QTYbXnFonKd-_A0m7v0dzk_2mboxeke8bZglR_bIA2IwdXu-hthaoYUCF6fEhISqq5yrN0u5XbrAwDp8zu5vpdzkxY2xqm5_5R7s-xgxKXAmAw2av-ZAILdm_Igi4_p6W50e_5nrlYlVtwCrExuEO9wMZ6QeVqe51_YuhoDTPIRmIVkT6xRbCZQRyon7Pj1GsmAJdver4H9CUzY3_EuGeScyUaAfxI5W4A",
    instructorImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSmMxWE22ueubIJO7cQvHScrZCRmA_MfjL4__QvJXPKBx4r6iNDTgHERtiIxQti3XIrp_48Z0b74F0nJwjhBWux_9XbYAt_vR81bnFm9-z3PpIjNBQUW-8_z7cSX6_j_HDTglLgpV6SpbRu2AFU-BLTog5vh328L-2YlRrt90pqNGJV8Z05JAFVErx13cbgBx4D5mVyxgEbUaYnynIq8ixMzzitmU8bTS2RwmJg3NWSnhf-Ja11p1FzMNAMBvK75NR7ciU88NhOQ",
  },
  {
    id: 3,
    category: "Coding",
    categoryColor: "text-[#F38181]",
    categoryBorder: "border-[#F38181]/20",
    title: "Lập trình Python: Tự động hóa và Phân tích dữ liệu",
    rating: "4.7",
    students: "2.5k học viên",
    instructor: "Hoàng Nam",
    price: "$59.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAFSFoBADtQKGNQIjGvne0n1vmFdHLjJC-84zmlq1WXtfan_qOvvIZPkTIxwqHFtDWSQ90rk1b5QYvuUaY3Rag92nc4_CkIzpTxTy36KBfHdhMJ16o7tb_tWi7S6mY8W-NYUsYbuPnswLUKg3_SFTD3ihYem9yD2eUW27PeYw3wtjHcpeO9f4MrKtER-XUkW0XaH7rKIjDLRjtMy3a0E9MPNUgGdjMWzrmmGpvnNU2gEm1RePs7EeX9Ky5fLVwK5hVaJUcZ43anw",
    instructorImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuARcet_BAEuA4-A_aFHa63C-tMiL3JPZufHEuOkyyTkSjY4pFXBzT93sTQumw-Ege2SLv9f7I59Fj7qHXfeAo5iF9TVg4Mk0xQlxOntOJ4ctiJ7kysUA5Slp-Ca7Eofoj8ieYoiXz2E1FznzESLCYFlhQsE05x36glRhwcBV_qkVrxG8wj2ziSUxh_UXAaoh9p4GTUKBivAE1cBt8b7K6I9U4edyjx905uv-YKJrWD0EyohCBulCAME6QiIJW0_aDE2FxKQHOqRrQ",
  },
  {
    id: 4,
    category: "Business",
    categoryColor: "text-green-700",
    categoryBorder: "border-green-200",
    title: "Kỹ năng lãnh đạo và quản lý đội nhóm hiệu quả",
    rating: "4.6",
    students: "500 học viên",
    instructor: "Thanh Hà",
    price: "$45.00",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKKQ6jyfZhlF5rFBQGGGd71xIBzyoQGMn1a9YfS8-tnkjAiLJUKR074Bk5cxubMkCdkKqZlehbvMChz3bdrqSd9DsBUsrm5TSUapt9QzwlGivT98YP4AxaKzcQFuoU8O5T1C3_IHRTdMFfM4dSF_aRRfYyAqu6qL8AiJ2pAj17mF0aiMremJ9tzdXZdMz8fHlvYsJoRZU3OsTovukvULiMOV2zPUC_gIULbeKju-7lARlCN7J1p_WXT5idMoHmdE4Hk7hKcVdL-g",
    instructorImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA50csvRrTCDksmCrNnQ8JMOlbitP6IJjPh4meGokJLhOI5nVaWALk-y1sn52YTAyeE_9Lov1br6Q65S9OS6B7bU9YvcglC1R-kxR6oWdsLx5TZ01eZ4uChZwuVDN1Q4rK0FIk0hoNWcIhjVeE49N_pRRbSnbdxXcp0x0gmDyEH7Zn_ZTtl8ukBbHRnXLlUd5tnkESYxYsu5FloxSwa7Oyj3Asm2eBJJE03i_ROqzBwx2jDdIEnhPLLm4QH1J_KB43CvYkuEBQLgg",
  },
];

export const PopularCourses = () => {
  return (
    <section className="py-16 mb-20 bg-[#f8f9fa] -mx-6 md:-mx-12 px-6 md:px-12 rounded-[3rem]">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-[#F38181] font-bold tracking-wider text-sm uppercase mb-2 block">Top Rated</span>
          <h2 className="text-3xl font-black text-[#1a202c] md:text-4xl mb-4">
            Khóa Học <span className="relative inline-block">Thịnh Hành <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FCE38A]/40 -z-10"></span></span>
          </h2>
          <p className="text-[#718096] text-lg">
            Các khóa học được yêu thích và đánh giá cao nhất tuần qua bởi cộng đồng học viên.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <div key={course.id} className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] h-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <img alt={course.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={course.image} />
                <div className={`absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1 text-xs font-bold ${course.categoryColor} backdrop-blur-sm shadow-sm border ${course.categoryBorder}`}>
                  {course.category}
                </div>
                <button className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                </button>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center gap-3 text-xs text-[#718096] font-bold">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span className="material-symbols-outlined text-base fill-current">star</span>
                    <span>{course.rating}</span>
                  </div>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span>{course.students}</span>
                </div>
                <h3 className="mb-3 text-lg font-extrabold leading-snug text-[#1a202c] group-hover:text-[#F38181] transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img alt="Instructor" className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-50" src={course.instructorImage} />
                    <span className="text-xs font-bold text-[#718096]">{course.instructor}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-[#F38181]">{course.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/courses" className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-8 text-base font-bold text-[#1a202c] shadow-sm transition-all hover:border-[#F38181] hover:text-[#F38181] hover:shadow-md">
            Xem Tất Cả Khóa Học
          </Link>
        </div>
      </div>
    </section>
  );
};
