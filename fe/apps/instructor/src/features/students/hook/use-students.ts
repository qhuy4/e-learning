import { useQuery } from "@tanstack/react-query";
import { studentService, type GetStudentsParams } from "@/features/students/services/student.service";

export function useStudents(params: GetStudentsParams) {
  return useQuery({
    queryKey: ["instructor-enrollments", params],
    queryFn: () => studentService.getStudents(params),
  });
}
