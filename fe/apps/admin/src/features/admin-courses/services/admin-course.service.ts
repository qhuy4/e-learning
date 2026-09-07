import type {PaginationResponse} from "@/shared/types/pagination.ts";
import type {AdminCourse} from "@/features/admin-courses/types/admin-course.ts";
import {adminApi} from "@/shared/lib/axios.ts";

export const adminCourseService = {
    async getCourses(
        page: number,
        limit: number,
        search?: string,
        sortBy?: string,
        sortOrder?: string,
        status?: number,
    ): Promise<PaginationResponse<AdminCourse>> {
        const response = await adminApi.get<PaginationResponse<AdminCourse>>("/courses/", {
            params: {
                page,
                limit,
                ...(search && {keyword: search}),
                ...(sortBy && {sortBy}),
                ...(sortOrder && {sortOrder}),
                ...(status !== undefined && {status}),
            }
        });
        return response.data;
    },

    async getCourse(id: string): Promise<AdminCourse> {
        const response = await adminApi.get<{data: AdminCourse}>(`/courses/${id}`);
        return response.data.data;
    },

    async reviewCourse(id: string, status: number, rejectReason?: string): Promise<AdminCourse> {
        const response = await adminApi.patch<{data: AdminCourse}>(`/courses/${id}/review`, {
            status,
            rejectReason,
        });
        return response.data.data;
    },

    async toggleLessonPreview(lessonId: string, isPreview: boolean) {
        const response = await adminApi.patch(`/courses/lessons/${lessonId}/preview`, {isPreview});
        return response.data;
    },

    async toggleLessonStatus(lessonId: string, status: number) {
        const response = await adminApi.patch(`/courses/lessons/${lessonId}/status`, {status});
        return response.data;
    },
};
