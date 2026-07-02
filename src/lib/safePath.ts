import path from 'path';

// Only these subdirectories under /public may be touched by the file APIs.
export const ALLOWED_FILE_TYPES = ['icons', 'backgrounds', 'uploads'] as const;
export type FileType = (typeof ALLOWED_FILE_TYPES)[number];

// Image extensions we accept for uploads. Note: SVG can contain scripts, so it
// is served from a separate path/type and treated as untrusted by the browser.
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
];

export function isAllowedType(type: string): type is FileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(type);
}

export function hasAllowedImageExtension(filename: string): boolean {
  return ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

/**
 * Resolve a user-supplied filename to an absolute path that is guaranteed to
 * live directly inside public/<type>. Returns null if the type is not allowed
 * or the filename attempts to escape the directory (path traversal).
 */
export function resolveSafeFilePath(type: string, filename: string): string | null {
  if (!isAllowedType(type)) return null;
  if (!filename || typeof filename !== 'string') return null;

  // Neutralize percent-encoded traversal (e.g. ..%2f..%2fetc%2fpasswd).
  let decoded: string;
  try {
    decoded = decodeURIComponent(filename);
  } catch {
    decoded = filename;
  }

  // Strip any directory components; keep only the final path segment.
  const base = path.basename(decoded);

  // Reject empty, current/parent dir, hidden/dotfiles, and stray separators.
  if (!base || base === '.' || base === '..' || base.startsWith('.')) return null;
  if (base.includes('/') || base.includes('\\') || base.includes('\0')) return null;

  const baseDir = path.join(process.cwd(), 'public', type);
  const resolved = path.join(baseDir, base);

  // Final containment check: resolved must stay inside baseDir.
  const relative = path.relative(baseDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  return resolved;
}
