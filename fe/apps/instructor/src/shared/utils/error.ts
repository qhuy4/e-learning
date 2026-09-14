export function getErrorMessage(err: unknown): string {
  const data = (err as any)?.response?.data;
  return data?.error?.message || data?.message || "Có lỗi xảy ra";
}
