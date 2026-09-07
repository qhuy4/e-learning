export function getAvatarUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
}
