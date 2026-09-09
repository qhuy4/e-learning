import { execFile } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import ffprobePath from '@ffprobe-installer/ffprobe';

const execFileAsync = promisify(execFile);

const MEDIA_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/webm',
]);

function isMediaMime(mimetype: string): boolean {
  return MEDIA_MIMES.has(mimetype);
}

export async function extractDuration(buffer: Buffer, mimetype: string): Promise<number | null> {
  if (!isMediaMime(mimetype)) return null;

  const ext = mimetype.includes('video') ? '.mp4' : '.mp3';
  const tmpPath = join(tmpdir(), `ffprobe-${Date.now()}${ext}`);

  try {
    await writeFile(tmpPath, buffer);
    const { stdout } = await execFileAsync(ffprobePath.path, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      tmpPath,
    ]);
    const parsed = JSON.parse(stdout);
    const duration = parseFloat(parsed?.format?.duration);
    if (Number.isFinite(duration) && duration > 0) {
      return Math.round(duration);
    }
    return null;
  } catch {
    return null;
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
