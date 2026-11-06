/**
 * Shared image engine for the image tools
 * (compress under 100KB / YouTube thumbnail / Etsy listing resizer).
 *
 * Pure browser APIs — canvas + File → Blob. No dependencies, no network,
 * files never leave the page. Components only handle UI.
 */

export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** True when the image has (or may have) transparent pixels. */
  hasAlpha: boolean;
}

export interface ImageResult {
  blob: Blob;
  width: number;
  height: number;
  /** Output MIME type, e.g. "image/jpeg". */
  type: string;
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This file could not be read as an image."));
    img.src = url;
  });
}

function detectAlpha(source: CanvasImageSource, width: number, height: number): boolean {
  try {
    const scale = Math.min(1, 64 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
  } catch {
    /* unreadable pixels — assume opaque */
  }
  return false;
}

/** Decode a File into something drawImage() accepts, plus an alpha check. */
export async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        hasAlpha: detectAlpha(bitmap, bitmap.width, bitmap.height),
      };
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(url);
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      hasAlpha: detectAlpha(img, img.naturalWidth, img.naturalHeight),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export interface CompressOptions {
  /** Target maximum size in kilobytes. */
  maxKB: number;
  /** Optional downscale ceiling for width (aspect ratio is preserved). */
  maxW?: number;
  /** Optional downscale ceiling for height (aspect ratio is preserved). */
  maxH?: number;
}

/**
 * Compress `file` to at most `maxKB`, optionally scaling down to fit
 * `maxW` × `maxH` (contain, never upscales).
 *
 * Strategy: binary-search JPEG quality (0.01–0.95); if the image still does
 * not fit at the lowest quality, shrink dimensions by 10% per step. PNG is
 * tried first when the source is PNG (keeps transparency), then it falls
 * back to JPEG with a white background.
 */
export async function compressToTarget(file: File, opts: CompressOptions): Promise<ImageResult> {
  const maxBytes = Math.max(1, opts.maxKB) * 1024;
  const img = await decodeImage(file);

  let w = img.width;
  let h = img.height;
  if (opts.maxW && w > opts.maxW) {
    h = Math.max(1, Math.round((h * opts.maxW) / w));
    w = opts.maxW;
  }
  if (opts.maxH && h > opts.maxH) {
    w = Math.max(1, Math.round((w * opts.maxH) / h));
    h = opts.maxH;
  }
  const baseW = w;
  const baseH = h;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  // PNG keeps transparency but ignores `quality`; JPEG compresses well.
  let type = file.type === "image/png" ? "image/png" : "image/jpeg";
  let best: ImageResult | null = null;

  for (let step = 0; step < 40; step++) {
    canvas.width = w;
    canvas.height = h;
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff"; // flatten transparency for JPEG
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img.source, 0, 0, w, h);

    if (type === "image/jpeg") {
      const probe = await encode(canvas, type, 0.01);
      if (probe && (!best || probe.size < best.blob.size)) {
        best = { blob: probe, width: w, height: h, type };
      }
      if (probe && probe.size <= maxBytes) {
        // Binary search: highest quality that still fits the budget.
        let lo = 0.01;
        let hi = 0.95;
        let fit = probe;
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          const b = await encode(canvas, type, mid);
          if (b && b.size <= maxBytes) {
            fit = b;
            lo = mid;
          } else {
            hi = mid;
          }
        }
        return { blob: fit, width: w, height: h, type };
      }
    } else {
      const b = await encode(canvas, type, 0.95);
      if (b && (!best || b.size < best.blob.size)) {
        best = { blob: b, width: w, height: h, type };
      }
      if (b && b.size <= maxBytes) {
        return { blob: b, width: w, height: h, type };
      }
    }

    // Still over budget → shrink dimensions by 10%.
    w = Math.max(1, Math.round(w * 0.9));
    h = Math.max(1, Math.round(h * 0.9));

    if (type === "image/png" && step >= 5) {
      // PNG cannot get smaller by quality — switch to JPEG at full size.
      type = "image/jpeg";
      w = baseW;
      h = baseH;
    } else if (type === "image/jpeg" && (w <= 48 || h <= 48)) {
      break; // best effort: return the smallest JPEG we produced
    }
  }

  if (best) return best;
  throw new Error("Could not compress this image to the requested size.");
}

export interface ResizeOptions {
  width: number;
  height: number;
  /** "pad" = fit inside with background; "cover" = fill and crop. */
  mode: "pad" | "cover";
  /** Background fill (used for "pad" and always for JPEG output). */
  background?: string;
  format?: "image/jpeg" | "image/png";
  quality?: number;
}

/** Resize to exact dimensions: letterboxed ("pad") or crop-to-fill ("cover"). */
export async function resizeTo(file: File, opts: ResizeOptions): Promise<ImageResult> {
  const img = await decodeImage(file);
  const { width: W, height: H } = opts;
  const type = opts.format ?? (file.type === "image/png" ? "image/png" : "image/jpeg");

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  if (type === "image/jpeg" || opts.background) {
    ctx.fillStyle = opts.background ?? "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }

  const scale =
    opts.mode === "pad"
      ? Math.min(W / img.width, H / img.height)
      : Math.max(W / img.width, H / img.height);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  ctx.drawImage(img.source, Math.round((W - w) / 2), Math.round((H - h) / 2), w, h);

  const blob = await encode(canvas, type, opts.quality ?? 0.92);
  if (!blob) throw new Error("Could not export this image.");
  return { blob, width: W, height: H, type };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
