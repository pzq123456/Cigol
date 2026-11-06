"use client";

import { useRef, useState } from "react";
import { formatBytes, resizeTo, type ImageResult } from "../_lib/image";

/**
 * Etsy listing image resizer — 2000×2000 output, two modes:
 * "pad"  = letterbox onto a white square (keeps the whole photo)
 * "cover" = crop to fill the square (no borders)
 * Shares the canvas base with the other image tools via `_lib/image.ts`.
 */

const SIZE = 2000;

interface Job {
  fileName: string;
  beforeBytes: number;
  result: ImageResult;
  originalUrl: string;
  url: string;
}

const EtsyListingImageResizer = () => {
  const [mode, setMode] = useState<"pad" | "cover">("pad");
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
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
      const result = await resizeTo(file, {
        width: SIZE,
        height: SIZE,
        mode,
        background: "#ffffff",
        format,
      });
      if (job) {
        URL.revokeObjectURL(job.url);
        URL.revokeObjectURL(job.originalUrl);
      }
      setJob({
        fileName: file.name,
        beforeBytes: file.size,
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
    a.download = `${base}-${SIZE}x${SIZE}.${ext}`;
    a.click();
  };

  const label =
    "text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest";
  const chip = (active: boolean) =>
    `px-3 py-2 text-xs font-bold rounded-lg border transition-all active:scale-95 ${
      active
        ? "border-orange-500 text-orange-500"
        : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-orange-500"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-2">
          <span className={label}>Resize mode</span>
          <div className="flex gap-2">
            <button
              className={chip(mode === "pad")}
              onClick={() => setMode("pad")}
            >
              Center on white
            </button>
            <button
              className={chip(mode === "cover")}
              onClick={() => setMode("cover")}
            >
              Crop to fill
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>Output format</span>
          <div className="flex gap-2">
            <button
              className={chip(format === "image/jpeg")}
              onClick={() => setFormat("image/jpeg")}
            >
              JPG
            </button>
            <button
              className={chip(format === "image/png")}
              onClick={() => setFormat("image/png")}
            >
              PNG
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>Output size</span>
          <span className="px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400">
            {SIZE} × {SIZE} px
          </span>
        </div>
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
          <span className="text-sm text-orange-500 font-bold">Resizing…</span>
        ) : (
          <span className="text-sm text-slate-500 dark:text-gray-400">
            Drop your listing photo here or{" "}
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
              <span>Original</span>
              <span className="font-mono normal-case">
                {formatBytes(job.beforeBytes)}
              </span>
            </div>
            <div className="h-48 bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.originalUrl}
                alt="Original listing photo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="rounded-xl border border-orange-500/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-orange-500">
              <span>{SIZE}×{SIZE} output</span>
              <span className="font-mono normal-case">
                {formatBytes(job.result.blob.size)}
              </span>
            </div>
            <div className="h-48 bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.url}
                alt="Resized listing photo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              onClick={download}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Download {SIZE}×{SIZE}
            </button>
            <span className="text-xs text-slate-500 dark:text-gray-400">
              {mode === "pad"
                ? "Centered on a white background — the whole photo stays visible."
                : "Fills the square and crops the edges — no borders."}
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-white/5 pt-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          How the Etsy Listing Image Resizer works
        </h2>
        <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
          <li>
            Upload a photo (it never leaves your browser) and pick a mode:
            center it on white, or crop it to fill the square.
          </li>
          <li>
            The tool renders an exact {SIZE}×{SIZE} pixel canvas — Etsy&apos;s
            recommended main listing image size.
          </li>
          <li>
            Download the JPG or PNG and upload it straight to your Etsy listing
            photos.
          </li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          Etsy listing images work best at {SIZE}×{SIZE} pixels with a shortest
          side of at least 1000px, which enables zoom on desktop and mobile.
          Use &quot;Center on white&quot; for products that need breathing room
          (jewelry, framed prints) and &quot;Crop to fill&quot; for full-bleed
          lifestyle shots.
        </p>
      </div>
    </div>
  );
};

export default EtsyListingImageResizer;
