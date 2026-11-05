import type { Course } from "../../types/course.types";

interface CoursePublishStepProps {
    data: Course;
}

export function CoursePublishStep({ data }: CoursePublishStepProps) {
    const sections = data.sections ?? [];
    const totalLessons = sections.reduce((acc, section) => acc + (section.lessons?.length ?? 0), 0);

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-lg font-medium">Review & Publish</h2>
                <p className="text-sm text-muted-foreground">Review your course details before publishing.</p>
            </div>

            <div className="border rounded-lg p-6 space-y-4 bg-card">
                <div>
                    <h3 className="font-semibold text-lg">{data.title || "Untitled Course"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{data.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{data.categoryId ? `#${data.categoryId}` : "Uncategorized"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium font-mono text-emerald-600">${data.price}</p>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Content Summary</p>
                    <div className="flex gap-4">
                        <div className="bg-muted px-3 py-2 rounded-md">
                            <span className="text-xl font-bold">{sections.length}</span>
                            <span className="text-sm text-muted-foreground ml-2">Sections</span>
                        </div>
                        <div className="bg-muted px-3 py-2 rounded-md">
                            <span className="text-xl font-bold">{totalLessons}</span>
                            <span className="text-sm text-muted-foreground ml-2">Lessons</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-md text-sm">
                <strong>Ready to publish?</strong> Once published, students will be able to purchase and enroll in this course. You can still make edits later.
            </div>
        </div>
    );
}
