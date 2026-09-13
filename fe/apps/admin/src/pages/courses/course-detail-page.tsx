import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import {ArrowLeft, ChevronDown, ChevronRight, Play, FileText, HelpCircle, Eye, EyeOff} from "lucide-react";
import {useAdminCourse, useReviewCourse, useToggleLessonPreview, useToggleLessonStatus} from "@/features/courses/hooks/use-admin-course";
import {courseStatusLabel, courseStatusClassName, courseLevelLabel, CourseStatus} from "@/features/courses/types/admin-course";
import {Badge} from "@fe/components/ui/badge.tsx";
import {Button} from "@fe/components/ui/button";
import {Separator} from "@fe/components/ui/separator";

function formatDate(date: Date | string | null) {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const lessonTypeIcon: Record<string, typeof Play> = {
    video: Play,
    document: FileText,
    quiz: HelpCircle,
};

function getYouTubeId(url: string): string | null {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtu\.be\/([^?]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function VideoPlayer({url}: {url: string}) {
    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
        return (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-full"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden bg-black">
            <video src={url} controls className="w-full max-h-[360px]"/>
        </div>
    );
}

function LessonDetail({lesson, courseId}: {lesson: any; courseId: string}) {
    const togglePreview = useToggleLessonPreview(courseId);
    const toggleStatus = useToggleLessonStatus(courseId);

    return (
        <div className="px-4 py-3 space-y-3 bg-muted/20">
            {lesson.videoUrl && <VideoPlayer url={lesson.videoUrl}/>}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs rounded-md border px-2 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={togglePreview.isPending}
                    onClick={() => togglePreview.mutate({lessonId: lesson.id, isPreview: !lesson.isPreview})}
                >
                    <Eye className="size-3"/>
                    {lesson.isPreview ? "Đang preview" : "Cho preview"}
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs rounded-md border px-2 py-1 hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={toggleStatus.isPending}
                    onClick={() => toggleStatus.mutate({lessonId: lesson.id, status: lesson.isActive ? 0 : 1})}
                >
                    {lesson.isActive ? <EyeOff className="size-3"/> : <Eye className="size-3"/>}
                    {lesson.isActive ? "Ẩn bài học" : "Hiện bài học"}
                </button>
            </div>

            {lesson.content && (
                <div className="rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                    <p className="text-sm whitespace-pre-wrap">{lesson.content}</p>
                </div>
            )}
        </div>
    );
}

export function CourseDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {data: course, isLoading} = useAdminCourse(id ?? "");
    const reviewMutation = useReviewCourse();

    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

    if (isLoading || !course) {
        return <div className="p-6 text-muted-foreground">Đang tải...</div>;
    }

    const status = course.status as CourseStatus;

    const handleApprove = () => {
        reviewMutation.mutate({id: course.id, status: CourseStatus.APPROVED}, {
            onSuccess: () => navigate("/courses"),
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        reviewMutation.mutate({id: course.id, status: CourseStatus.REJECTED, rejectReason}, {
            onSuccess: () => navigate("/courses"),
        });
    };

    const handlePublish = () => {
        reviewMutation.mutate({id: course.id, status: CourseStatus.PUBLISHED}, {
            onSuccess: () => navigate("/courses"),
        });
    };

    const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ?? 0;

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const toggleLesson = (lessonId: string) => {
        setExpandedLessons((prev) => {
            const next = new Set(prev);
            if (next.has(lessonId)) {
                next.delete(lessonId);
            } else {
                next.add(lessonId);
            }
            return next;
        });
    };

    return (
        <div className="p-6 mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate("/courses")} className="-ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>

                <div className="flex items-center gap-2 shrink-0">
                    {status === CourseStatus.APPROVED && (
                        <Button size="sm" onClick={handlePublish} disabled={reviewMutation.isPending}>
                            Xuất bản
                        </Button>
                    )}
                    {status === CourseStatus.PENDING_REVIEW && (
                        <>
                            <Button size="sm" onClick={handleApprove} disabled={reviewMutation.isPending}>
                                Duyệt
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowRejectInput(true)} disabled={reviewMutation.isPending}>
                                Từ chối
                            </Button>
                        </>
                    )}
                    {status === CourseStatus.REJECTED && (
                        <Button size="sm" onClick={() => setShowRejectInput(true)} disabled={reviewMutation.isPending}>
                            Phản hồi lại
                        </Button>
                    )}
                </div>
            </div>

            {showRejectInput && (
                <div className="flex items-center gap-2">
                    {course.rejectReason && status === CourseStatus.REJECTED && (
                        <span className="text-sm text-muted-foreground">Lý do cũ: {course.rejectReason}</span>
                    )}
                    <input
                        id="reject-reason"
                        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Nhập lý do từ chối..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button variant="destructive" size="sm" onClick={handleReject} disabled={reviewMutation.isPending || !rejectReason.trim()}>
                        Gửi
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {setShowRejectInput(false); setRejectReason("");}}>
                        Hủy
                    </Button>
                </div>
            )}

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex gap-4">
                    {course.thumbnail && (
                        <img src={course.thumbnail} alt={course.title} className="rounded-lg w-24 h-24 object-cover shrink-0"/>
                    )}
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold">{course.title}</h1>
                        <div className="flex items-center gap-2">
                            <Badge className={courseStatusClassName[status]}>
                                {courseStatusLabel[status]}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {courseLevelLabel[course.level as keyof typeof courseLevelLabel] ?? "N/A"}
                            </span>
                            <span className="text-sm text-muted-foreground">|</span>
                            <span className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(course.price)}
                            </span>
                        </div>
                        {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                        )}
                    </div>
                </div>

                <Separator/>

                {course.categories && course.categories.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-muted-foreground">Danh mục</p>
                        <div className="flex flex-wrap gap-2">
                            {course.categories.map((cat) => (
                                <Badge key={cat.id} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <Separator/>

                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Chương</p>
                        <p className="font-medium">{course.sections?.length ?? 0}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Bài học</p>
                        <p className="font-medium">{totalLessons}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ngày tạo</p>
                        <p className="font-medium">{formatDate(course.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Ngày duyệt</p>
                        <p className="font-medium">{formatDate(course.reviewedAt)}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h2 className="text-sm font-semibold">Nội dung ({course.sections?.length ?? 0} chương / {totalLessons} bài học)</h2>
                <Separator/>
                <div className="space-y-3">
                    {course.sections?.map((section, sIdx) => {
                        const isExpanded = expandedSections.has(section.id);
                        return (
                            <div key={section.id} className="border rounded-lg">
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors text-left"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? <ChevronDown className="size-4"/> : <ChevronRight className="size-4"/>}
                                        <span className="text-sm font-medium">Chương {sIdx + 1}: {section.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{section.lessons?.length ?? 0} bài học</span>
                                </button>
                                {isExpanded && section.lessons && section.lessons.length > 0 && (
                                    <div className="divide-y">
                                        {section.lessons.map((lesson, lIdx) => {
                                            const isLessonExpanded = expandedLessons.has(lesson.id);
                                            const Icon = lessonTypeIcon[lesson.type] ?? FileText;
                                            return (
                                                <div key={lesson.id}>
                                                    <button
                                                        type="button"
                                                        className="w-full px-4 py-2.5 flex items-center justify-between text-sm cursor-pointer hover:bg-muted/30 transition-colors text-left"
                                                        onClick={() => toggleLesson(lesson.id)}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {isLessonExpanded ? <ChevronDown className="size-3 shrink-0"/> : <ChevronRight className="size-3 shrink-0"/>}
                                                            <Icon className="size-3.5 text-muted-foreground shrink-0"/>
                                                            <span className="truncate text-muted-foreground">
                                                                {lIdx + 1}. {lesson.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-2">
                                                            {lesson.isPreview && (
                                                                <Badge variant="outline" className="text-xs">Preview</Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
                                                            {lesson.duration != null && lesson.duration > 0 && (
                                                                <span>{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                    {isLessonExpanded && (
                                                        <LessonDetail lesson={lesson} courseId={course.id}/>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
