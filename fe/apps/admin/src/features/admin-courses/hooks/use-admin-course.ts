import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {adminCourseService} from "@/features/admin-courses/services/admin-course.service"

export const adminCourseKeys = {
    all: ["admin-courses"] as const,
    lists: () => [...adminCourseKeys.all, "list"] as const,
    list: (page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, status?: number) =>
        [...adminCourseKeys.lists(), {page, limit, search, sortBy, sortOrder, status}] as const,
    details: () => [...adminCourseKeys.all, "detail"] as const,
    detail: (id: string) => [...adminCourseKeys.details(), id] as const,
}

export function useAdminCourses(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    status?: number,
) {
    return useQuery({
        queryKey: adminCourseKeys.list(page, limit, search, sortBy, sortOrder, status),
        queryFn: () => adminCourseService.getCourses(page, limit, search, sortBy, sortOrder, status),
    })
}

export function useAdminCourse(id: string) {
    return useQuery({
        queryKey: adminCourseKeys.detail(id),
        queryFn: () => adminCourseService.getCourse(id),
        enabled: !!id,
    })
}

export function useReviewCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({id, status, rejectReason}: {id: string; status: number; rejectReason?: string}) =>
            adminCourseService.reviewCourse(id, status, rejectReason),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({queryKey: adminCourseKeys.lists()})
            void queryClient.invalidateQueries({queryKey: adminCourseKeys.detail(variables.id)})
        },
    })
}

export function useToggleLessonPreview(courseId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({lessonId, isPreview}: {lessonId: string; isPreview: boolean}) =>
            adminCourseService.toggleLessonPreview(lessonId, isPreview),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: adminCourseKeys.detail(courseId)})
        },
    })
}

export function useToggleLessonStatus(courseId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({lessonId, status}: {lessonId: string; status: number}) =>
            adminCourseService.toggleLessonStatus(lessonId, status),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: adminCourseKeys.detail(courseId)})
        },
    })
}
