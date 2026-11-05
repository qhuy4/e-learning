import { useEffect, useState } from 'react';
import {
  NotebookPen,
  Pencil,
  Trash2,
  Check,
  X,
  LogIn,
  Plus,
  Clock3,
  Play,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  useLessonNotes,
  useCreateLessonNote,
  useUpdateLessonNote,
  useDeleteLessonNote,
} from '../../hooks/use-learning';
import type { LessonNote } from '../../types/learning.type';
import type { VideoPlayerHandle } from '../LearningPlayer/VideoPlayer';
import type { RefObject } from 'react';

// mm:ss (hoặc h:mm:ss nếu video trên 1 giờ)
const formatTimestamp = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

interface LessonNotesProps {
  lessonId: number;
  /** Ref player video — đọc thời điểm hiện tại và tua về note (null với bài không có video) */
  videoRef?: RefObject<VideoPlayerHandle | null>;
}

export const LessonNotes = ({ lessonId, videoRef }: LessonNotesProps) => {
  const { isAuthenticated } = useAuth();
  const { data: notes, isLoading } = useLessonNotes(lessonId, isAuthenticated);
  const createNote = useCreateLessonNote();
  const updateNote = useUpdateLessonNote();
  const deleteNote = useDeleteLessonNote();

  const [draft, setDraft] = useState('');
  // Thời điểm hiện tại của video — hiển thị "ghi chú tại mm:ss" chạy theo video.
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!videoRef) return;
    const timer = window.setInterval(() => {
      setCurrentSeconds(videoRef.current?.getCurrentTime() ?? 0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [videoRef]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
          <LogIn className="h-5 w-5" />
        </span>
        <p className="text-sm font-bold text-slate-600">Đăng nhập để lưu ghi chú</p>
        <p className="text-xs font-medium text-slate-400">
          Ghi chú được gắn theo mốc thời gian của video để bạn xem lại sau.
        </p>
      </div>
    );
  }

  const seekToNote = (seconds: number) => {
    if (!videoRef?.current) return;
    videoRef.current.seekTo(seconds);
    toast.success(`Đã tua về ${formatTimestamp(seconds)}`);
  };

  const handleCreate = async () => {
    const content = draft.trim();
    if (!content) return;
    // "Đóng băng" thời điểm lúc bấm Lưu — lấy trực tiếp từ video, không lấy từ interval.
    const at = Math.round(videoRef?.current?.getCurrentTime() ?? 0);
    try {
      await createNote.mutateAsync({ lessonId, noteTimeSeconds: at, content });
      setDraft('');
      toast.success(`Đã lưu ghi chú tại ${formatTimestamp(at)}`);
    } catch {
      toast.error('Không lưu được ghi chú. Vui lòng thử lại.');
    }
  };

  const handleUpdate = async (note: LessonNote) => {
    const content = editDraft.trim();
    if (!content) return;
    try {
      await updateNote.mutateAsync({ id: note.id, content });
      setEditingId(null);
      toast.success('Đã cập nhật ghi chú');
    } catch {
      toast.error('Không cập nhật được ghi chú. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (note: LessonNote) => {
    try {
      await deleteNote.mutateAsync({ id: note.id, lessonId });
      setConfirmDeleteId(null);
      toast.success('Đã xóa ghi chú');
    } catch {
      toast.error('Không xóa được ghi chú. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Card thêm ghi chú tại thời điểm video đang phát */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
            <NotebookPen className="h-4 w-4" />
          </span>
          <p className="text-sm font-extrabold text-slate-900">Ghi chú của bạn</p>
          <span className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-500">
            {notes?.length ?? 0} ghi chú
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Chip thời điểm hiện tại của video */}
          <span className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-piemind-pink px-3.5 py-2.5 text-sm font-extrabold tabular-nums text-white shadow-[0_4px_16px_rgba(243,129,129,0.3)] sm:self-auto">
            <Clock3 className="h-4 w-4" />
            {formatTimestamp(currentSeconds)}
          </span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate();
            }}
            maxLength={2000}
            placeholder="Thêm ghi chú tại thời điểm này..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm transition-colors focus:border-piemind-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-piemind-pink/20"
          />
          <button
            onClick={() => void handleCreate()}
            disabled={!draft.trim() || createNote.isPending}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-piemind-pink px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(243,129,129,0.3)] transition-all hover:bg-piemind-pink/90 hover:shadow-piemind-pink/40 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {createNote.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Lưu ghi chú
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-400">
          Ghi chú sẽ gắn với thời điểm {formatTimestamp(currentSeconds)} của video.
        </p>
      </div>

      {/* Danh sách ghi chú */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-piemind-pink" />
          Đang tải ghi chú...
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-piemind-pink/10 text-piemind-pink">
            <NotebookPen className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-slate-600">Chưa có ghi chú nào</p>
          <p className="max-w-xs text-xs font-medium text-slate-400">
            Nhập nội dung phía trên rồi bấm "Lưu ghi chú" để đánh dấu khoảnh khắc bạn muốn xem lại.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-piemind-pink/40 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
            >
              {/* Bấm vào mốc thời gian → tua video về đây */}
              <button
                onClick={() => seekToNote(note.noteTimeSeconds)}
                title="Bấm để tua video về ghi chú này"
                className="mt-0.5 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-piemind-pink/10 px-3 py-1.5 text-sm font-extrabold tabular-nums text-piemind-pink transition-colors hover:bg-piemind-pink hover:text-white"
              >
                <Play className="h-3.5 w-3.5" />
                {formatTimestamp(note.noteTimeSeconds)}
              </button>

              {editingId === note.id ? (
                <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    maxLength={2000}
                    autoFocus
                    className="min-h-[70px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm focus:border-piemind-pink focus:bg-white focus:outline-none focus:ring-2 focus:ring-piemind-pink/20"
                  />
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => void handleUpdate(note)}
                      disabled={!editDraft.trim() || updateNote.isPending}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-piemind-pink px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-piemind-pink/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words pt-0.5 text-sm leading-relaxed text-slate-700">
                    {note.content}
                  </p>
                  <div className="-mt-0.5 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditDraft(note.content);
                        setConfirmDeleteId(null);
                      }}
                      aria-label="Sửa ghi chú"
                      title="Sửa ghi chú"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {confirmDeleteId === note.id ? (
                      <button
                        onClick={() => void handleDelete(note)}
                        aria-label="Xác nhận xóa"
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa?
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setConfirmDeleteId(note.id);
                          setEditingId(null);
                        }}
                        aria-label="Xóa ghi chú"
                        title="Xóa ghi chú"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
