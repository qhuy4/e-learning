import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examPackageImportService } from "../services/exam-package-import.service";
import type {
  PackageImportPatch,
  PackageImportPreview,
  PackageImportResult,
} from "../types/exam-package-import";
import { examKeys } from "./use-exams";

/** Upload the ZIP and get back the structure + validation report (no writes). */
export function usePreviewPackageImport() {
  return useMutation({
    mutationFn: ({
      examId,
      file,
      patch,
    }: {
      examId: number;
      file: File;
      patch?: PackageImportPatch;
    }): Promise<PackageImportPreview> =>
      examPackageImportService.preview(examId, file, patch),
  });
}

/** Confirm the import (media + content); invalidates all exam queries. */
export function useConfirmPackageImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      file,
      patch,
    }: {
      examId: number;
      file: File;
      patch?: PackageImportPatch;
    }): Promise<PackageImportResult> =>
      examPackageImportService.confirm(examId, file, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
}
