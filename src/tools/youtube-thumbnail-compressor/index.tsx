"use client";

import { useRef, useState } from "react";
import {
  compressToTarget,
  decodeImage,
  formatBytes,
  type ImageResult,
} from "../_lib/image";

/**
 * YouTube thumbnail compressor — thin shell over `_lib/image.ts`.
 * Same engine as "Compress Image Under 100KB", different spec preset:
 * target just under YouTube's 2 MB upload limit, fit inside 1280×720.
 */

const TARGET_KB = 1950; // YouTube's limit is 2 MB; aim under 2,000,000 bytes
const MAX_W = 1280;
const MAX_H = 720;

interface Job {
  fileName: string;
  beforeBytes: number;
  beforeWidth: number;
  beforeHeight: number;
  result: ImageResult;
  originalUrl: string;
  url: string;
}

const YouTubeThumbnailCompressor = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Use JPG, PNG or WebP.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const before = await decodeImage(file);
      const result = await compressToTarget(file, {
        maxKB: TARGET_KB,
        maxW: MAX_W,
        maxH: MAX_H,
      });
      if (job) {
        URL.revokeObjectURL(job.url);
        URL.revokeObjectURL(job.originalUrl);
      }
      setJob({
        fileName: file.name,
        beforeBytes: file.size,
        beforeWidth: before.width,
        beforeHeight: before.height,
        result,
        originalUrl: URL.createObjectURL(file),
        url: URL.createObjectURL(result.blob),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!job) return;
    const ext = job.result.type === "image/png" ? "png" : "jpg";
    const base = job.fileName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = job.url;
    a.download = `${base}-youtube-thumbnail.${ext}`;
    a.click();
  };

  const saved =
    job && job.beforeBytes > 0
      ? Math.round((1 - job.result.blob.size / job.beforeBytes) * 100)
      : 0;

  const label =
    "text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full border border-orange-500/50 text-orange-500 font-bold">
          Under 2 MB ({TARGET_KB} KB target)
        </span>
        <span className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 font-bold">
          Fits 1280×720
        </span>
        <span className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 font-bold">
          100% local
        </span>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          run(e.dataTransfer.files?.[0]);
        }}
        className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors px-4 py-8 text-center cursor-pointer"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = ""; // allow re-picking the same file
            run(f);
          }}
        />
        {busy ? (
          <span className="text-sm text-orange-500 font-bold">
            Compressing thumbnail…
          </span>
        ) : (
          <span className="text-sm text-slate-500 dark:text-gray-400">
            Drop your thumbnail here or{" "}
            <span className="text-orange-500 font-bold">browse files</span> — it
            stays on your device
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {job && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
              <span>Before</span>
              <span className="font-mono normal-case">
                {formatBytes(job.beforeBytes)} · {job.beforeWidth}×
                {job.beforeHeight}
              </span>
            </div>
            <div className="h-40 bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.originalUrl}
                alt="Original thumbnail"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="rounded-xl border border-orange-500/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-orange-500">
              <span>After — {saved}% smaller</span>
              <span className="font-mono normal-case">
                {formatBytes(job.result.blob.size)} · {job.result.width}×
                {job.result.height}
              </span>
            </div>
            <div className="h-40 bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.url}
                alt="Compressed thumbnail"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              onClick={download}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Download {formatBytes(job.result.blob.size)}
            </button>
            <span className="text-xs text-slate-500 dark:text-gray-400">
              Output: {job.result.type === "image/png" ? "PNG" : "JPG"} · ready
              for the YouTube thumbnail upload slot
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-white/5 pt-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          How the YouTube Thumbnail Compressor keeps files under 2 MB
        </h2>
        <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
          <li>
            Drop in any JPG, PNG or WebP. The image is scaled to fit inside
            1280×720 — YouTube&apos;s recommended thumbnail resolution — without
            distorting the aspect ratio.
          </li>
          <li>
            The engine searches JPEG quality levels for the best-looking image
            that stays under {TARGET_KB} KB, safely below YouTube&apos;s 2 MB
            upload limit.
          </li>
          <li>
            Download and upload it to YouTube Studio. Everything happens in
            your browser — no upload, no sign-up, no watermark.
          </li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          A YouTube thumbnail compressor is useful when a design exported from
          Figma, Canva or Photoshop comes out well over the 2 MB limit. This
          tool hits the size ceiling first and only reduces resolution if
          quality alone cannot get the file under the limit, so your cover image
          stays as sharp as possible.
        </p>
      </div>
    </div>
  );
};

export default YouTubeThumbnailCompressor;
