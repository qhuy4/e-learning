import { adminApi } from "@/shared/lib/axios.ts";
import type {
  PackageImportPatch,
  PackageImportPreview,
  PackageImportResult,
} from "../types/exam-package-import";

export const examPackageImportService = {
  /** Download the ZIP template generated from the exam's format (DB-driven). */
  async downloadTemplate(examId: number): Promise<void> {
    const response = await adminApi.get(`/exams/${examId}/import-template`, {
      responseType: "blob",
      // Never reuse a stale cached template.
      params: { t: Date.now() },
    });
    const disposition = String(response.headers?.["content-disposition"] ?? "");
    const serverName = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
    const url = URL.createObjectURL(response.data as Blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = serverName ?? "import-package.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  },

  /** Upload the filled ZIP → extract + validate (read-only, nothing saved). */
  async preview(
    examId: number,
    file: File,
    patch?: PackageImportPatch,
  ): Promise<PackageImportPreview> {
    const formData = new FormData();
    formData.append("file", file);
    appendPatch(formData, patch);
    const response = await adminApi.post(
      `/exams/${examId}/import/preview`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },

  /** Confirm: uploads media + saves content — BE refuses while errors exist. */
  async confirm(
    examId: number,
    file: File,
    patch?: PackageImportPatch,
  ): Promise<PackageImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    appendPatch(formData, patch);
    const response = await adminApi.post(
      `/exams/${examId}/import/confirm`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  },
};

/** Non-empty patch travels as a multipart text field (JSON string). */
function appendPatch(formData: FormData, patch?: PackageImportPatch): void {
  if (!patch) return;
  if ((patch.removedRows?.length ?? 0) === 0 && (patch.edits?.length ?? 0) === 0) return;
  formData.append("patch", JSON.stringify(patch));
}
