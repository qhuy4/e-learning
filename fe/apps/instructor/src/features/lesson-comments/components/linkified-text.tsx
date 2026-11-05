import type { ReactNode } from "react";

// URL trong bình luận → link bấm mở tab mới (không nhúng video — giữ thread nhẹ).
const URL_RE = /https?:\/\/[^\s<>"']+/g;

/**
 * Render nội dung bình luận, tự động link hóa mọi URL.
 * Giáo viên bấm link là nhảy sang video/bài được nhắc tới.
 */
export function LinkifiedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    // Tách dấu câu/dấu . dán sát cuối URL để link không bị "kèm" theo.
    const url = match[0].replace(/[.,;:!?)\]}]+$/, "");
    const trail = match[0].slice(url.length);
    nodes.push(
      <a
        key={start}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {url}
      </a>,
    );
    if (trail) nodes.push(trail);
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
