"use client";

import { useRef, useState } from "react";
import {
  compressToTarget,
  decodeImage,
  formatBytes,
  type ImageResult,
} from "../_lib/image";

/**
 * Compress an image to under a target size (100KB by default).
 * UI shell around `_lib/image.ts` — files never leave the browser.
 */

interface Job {
  fileName: string;
  beforeBytes: number;
  beforeWidth: number;
  beforeHeight: number;
  isPng: boolean;
  hasAlpha: boolean;
  result: ImageResult;
  originalUrl: string;
  url: string;
}

const PRESETS = [50, 100, 200];

const ImageCompressUnder100kb = () => {
  const [targetKB, setTargetKB] = useState("100");
  const [maxWidth, setMaxWidth] = useState("");
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
    const maxKB = parseFloat(targetKB);
    if (!Number.isFinite(maxKB) || maxKB <= 0) {
      setError("Enter a target size in KB greater than 0.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const before = await decodeImage(file);
      const cap = parseFloat(maxWidth);
      const result = await compressToTarget(file, {
        maxKB,
        maxW: Number.isFinite(cap) && cap > 0 ? cap : undefined,
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
        isPng: file.type === "image/png",
        hasAlpha: before.hasAlpha,
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
    a.download = `${base}-${targetKB}kb.${ext}`;
    a.click();
  };

  const saved =
    job && job.beforeBytes > 0
      ? Math.round((1 - job.result.blob.size / job.beforeBytes) * 100)
      : 0;

  const label =
    "text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest";
  const input =
    "rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2 font-mono text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-orange-500 transition-colors";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Target size (KB)</span>
          <input
            type="number"
            min={1}
            value={targetKB}
            onChange={(e) => setTargetKB(e.target.value)}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Max width (px, optional)</span>
          <input
            type="number"
            min={1}
            placeholder="original"
            value={maxWidth}
            onChange={(e) => setMaxWidth(e.target.value)}
            className={input}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className={label}>Presets</span>
          <div className="flex gap-2">
            {PRESETS.map((kb) => (
              <button
                key={kb}
                onClick={() => setTargetKB(String(kb))}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all active:scale-95 ${
                  targetKB === String(kb)
                    ? "border-orange-500 text-orange-500"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-orange-500"
                }`}
              >
                {kb}KB
              </button>
            ))}
          </div>
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
          <span className="text-sm text-orange-500 font-bold">
            Compressing…
          </span>
        ) : (
          <span className="text-sm text-slate-500 dark:text-gray-400">
            Drop an image here or{" "}
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
                alt="Original preview"
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
                alt="Compressed preview"
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
              Output: {job.result.type === "image/png" ? "PNG" : "JPG"}
              {job.result.type === "image/jpeg" && job.isPng && job.hasAlpha
                ? " — transparency was flattened to white to reach the target size"
                : job.isPng
                  ? " (original format kept)"
                  : ""}
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-white/5 pt-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          How to compress an image under 100KB
        </h2>
        <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
          <li>
            Drop in a JPG, PNG or WebP — nothing is uploaded, the whole
            compression runs in your browser.
          </li>
          <li>
            The tool first lowers JPEG quality (a binary search between 1% and
            95%) to find the best-looking image that fits {targetKB || "100"}KB.
          </li>
          <li>
            If quality alone is not enough, it scales the image down in 10%
            steps until the file is under the limit, then hands you the result
            to download.
          </li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          Compressing an image under 100KB is the standard requirement for
          resume uploads, job application forms, passport photos, helpdesk
          tickets and government portals. Files that must stay transparent (PNG
          logos, screenshots with alpha) are kept as PNG when possible, and only
          converted to JPG — with the background flattened to white — if the
          target size demands it.
        </p>
      </div>
    </div>
  );
};

export default ImageCompressUnder100kb;
