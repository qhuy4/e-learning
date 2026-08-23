import { Star, Heart } from "lucide-react";

export const RelatedCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Khởi tạo Digital Marketing cho người mới bắt đầu",
      instructor: "Khoa Tuấn",
      price: "$49.00",
      rating: 4.8,
      reviews: 850,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Học Design cơ bản: HTML5 & CSS3",
      instructor: "Bảo Vy",
      price: "$59.00",
      rating: 4.7,
      reviews: 420,
      image: "https://images.unsplash.com/photo-1507238692062-110eb8f14ac1?w=500&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Lập trình Python: Tự động hóa và Phân tích dữ liệu",
      instructor: "Hoàng Nam",
      price: "$69.00",
      rating: 4.9,
      reviews: 1250,
      image: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=500&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Kỹ năng lãnh đạo và quản lý đội nhóm hiệu quả",
      instructor: "Thanh Hải",
      price: "$79.00",
      rating: 4.6,
      reviews: 320,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop",
    },
  ];

  return (
    <div className="pt-8 border-t border-slate-200 mt-12">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Khóa học liên quan</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="group cursor-pointer">
            <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-slate-100">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-2 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{course.rating}</span>
              <span className="text-slate-400 font-normal">({course.reviews})</span>
            </div>
            
            <h3 className="font-bold text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
              {course.title}
            </h3>
            
            <div className="text-xs text-slate-500 mb-2">
              {course.instructor}
            </div>
            
            <div className="font-bold text-rose-500">
              {course.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
