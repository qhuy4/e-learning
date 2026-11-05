import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@fe/components/ui/button";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { useCreateDictation, useUpdateDictation, useAttachDictationToLesson, useGetDictationById } from "../hook/use-dictations";
import { useGetCourseDetail } from "@/features/courses/hook/use-courses";
import type { Dictation, DictationSentence } from "../types/dictation.types";
import { DictationLevel } from "../types/dictation.types";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/utils/error";
import DictationSettings from "../components/dictation-settings";
import DictationSentenceList from "../components/dictation-sentence-list";
import DictationGuide from "../components/dictation-guide";

export default function CreateDictationPage() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const courseId = searchParams.get("courseId");
  const editId = searchParams.get("editId");
  const navigate = useNavigate();

  const { data: courseData } = useGetCourseDetail(courseId ?? undefined);
  const { data: dictationResponse, isLoading: isLoadingDictation } = useGetDictationById(editId ? Number(editId) : undefined);
  const { mutateAsync: createDictation, isPending: isCreating } = useCreateDictation();
  const { mutateAsync: updateDictation, isPending: isUpdating } = useUpdateDictation();
  const { mutateAsync: attachToLesson } = useAttachDictationToLesson();
  const isSaving = isCreating || isUpdating;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | string | undefined>(undefined);
  const [level, setLevel] = useState<DictationLevel>(DictationLevel.BEGINNER);
  const [playLimit, setPlayLimit] = useState<number | "">("");
  const [sentences, setSentences] = useState<DictationSentence[]>([]);

  useEffect(() => {
    if (dictationResponse?.data ?? dictationResponse) {
      const d = (dictationResponse.data ?? dictationResponse) as Dictation;
      setTitle(d.title || "");
      setDescription(d.description || "");
      setAudioFile(d.audioUrl || "");
      setLevel(d.level || DictationLevel.BEGINNER);
      setPlayLimit(d.playLimit || "");
      if (d.sentences) setSentences(d.sentences);
    }
  }, [dictationResponse]);

  const toCourse = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/content`);
    } else {
      navigate(-1);
    }
  };

  const hasAudio = audioFile instanceof File || (typeof audioFile === "string" && audioFile.length > 0);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Vui long nhap ten bai tap.");
      return;
    }
    if (!hasAudio) {
      toast.error("Vui long tai len file audio.");
      return;
    }
    if (sentences.length === 0) {
      toast.error("Vui long them it nhat 1 cau.");
      return;
    }

    const payload: Dictation = {
      title: title.trim(),
      description: description.trim() || null,
      audioUrl: typeof audioFile === "string" ? audioFile : "",
      level,
      playLimit: playLimit === "" ? null : Number(playLimit),
      sentences: sentences.map((s, i) => ({ ...s, position: i + 1 })),
    };

    const audioFileObj = audioFile instanceof File ? audioFile : undefined;

    try {
      if (editId) {
        const tid = toast.loading("Dang cap nhat Dictation...");
        await updateDictation({ id: Number(editId), data: payload, audioFile: audioFileObj });
        toast.success("Da cap nhat thanh cong!", { id: tid });
        toCourse();
      } else {
        const tid = toast.loading("Dang tao Dictation...");
        const created = await createDictation({ data: payload, audioFile: audioFileObj });
        const createdData = (created as any)?.data ?? created;
        const newId = createdData?.id;

        if (lessonId && newId) {
          toast.loading("Dang gan vao bai hoc...", { id: tid });
          await attachToLesson({ dictationId: newId, lessonId });
        }

        toast.success("Da tao Dictation thanh cong!", { id: tid });
        toCourse();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoadingDictation) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={toCourse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p>Dang tai du lieu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={toCourse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {editId ? "Chinh sua Nghe chep chinh ta" : "Tao bai Nghe chep chinh ta"}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={toCourse} disabled={isSaving}>Huy</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Dang luu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Luu Dictation
              </>
            )}
          </Button>
        </div>
      </div>

      <DictationGuide />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <DictationSettings
            title={title} setTitle={setTitle}
            description={description} setDescription={setDescription}
            audioFile={audioFile} setAudioFile={setAudioFile}
            level={level} setLevel={setLevel}
            playLimit={playLimit} setPlayLimit={setPlayLimit}
          />
        </div>
        <div className="col-span-8">
          <DictationSentenceList
            sentences={sentences}
            onChange={setSentences}
          />
        </div>
      </div>
    </div>
  );
}
