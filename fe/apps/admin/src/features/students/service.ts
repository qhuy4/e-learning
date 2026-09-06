import type {PaginationResponse} from "@/shared/types/pagination.ts";
import type {Student} from "@/features/students/types/student.ts";
import {adminApi} from "@/shared/lib/axios.ts";

const STUDENT_ROLE = 3;

export const studentService = {
    async getStudents(
        page: number,
        limit: number,
        search?: string,
        sortBy?: string,
        sortOrder?: string,
    ): Promise<PaginationResponse<Student>> {
        const response = await adminApi.get<PaginationResponse<Student>>("/users/", {
            params: {
                page,
                limit,
                role: STUDENT_ROLE,
                ...(search && {search}),
                ...(sortBy && {sortBy}),
                ...(sortOrder && {sortOrder}),
            }
        });
        return response.data;
    },
};
