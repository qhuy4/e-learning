import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  lessonCommentsService,
  type InstructorCommentsParams,
} from "@/features/lesson-comments/services/lesson-comments.service";

/** Danh sách câu hỏi + thống kê (giữ data cũ khi đổi trang/bộ lọc). */
export function useInstructorComments(params: InstructorCommentsParams) {
  return useQuery({
    queryKey: ["instructor-lesson-comments", "list", params],
    queryFn: () => lessonCommentsService.getList(params),
    placeholderData: keepPreviousData,
  });
}

/** Chi tiết một nhánh bình luận (gốc + các cấp trả lời). */
export function useCommentThread(rootId: number | undefined) {
  return useQuery({
    queryKey: ["instructor-lesson-comments", "thread", rootId],
    queryFn: () => lessonCommentsService.getThread(rootId!),
    enabled: !!rootId,
  });
}

/** Trả lời — invalidate cả list (đổi replyCount/đã trả lời) lẫn thread. */
export function useReplyLessonComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lessonCommentsService.reply,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-lesson-comments"],
      });
    },
  });
}
