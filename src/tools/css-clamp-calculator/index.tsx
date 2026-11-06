"use client";

import { useMemo, useState } from "react";

/**
 * CSS clamp() calculator / fluid type scale generator.
 * Pure math, zero dependencies, single component.
 */

const RATIOS = [
  { value: "1.125", label: "1.125 — Major Second" },
  { value: "1.2", label: "1.2 — Minor Third" },
  { value: "1.25", label: "1.25 — Major Third" },
  { value: "1.333", label: "1.333 — Perfect Fourth" },
  { value: "1.5", label: "1.5 — Perfect Fifth" },
] as const;

const STEPS = [-2, -1, 0, 1, 2, 3];

function num(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : NaN;
}

function round(n: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/** Preferred value as `calc(Xvw + Ypx)` for a linear min→max mapping. */
function preferredValue(min: number, max: number, minVW: number, maxVW: number): string {
  const slope = (max - min) / (maxVW - minVW); // px of font per px of viewport
  const intercept = min - slope * minVW;
  const vw = round(slope * 100);
  const px = round(intercept, 2);
  return `calc(${vw}vw ${px < 0 ? "-" : "+"} ${Math.abs(px)}px)`;
}

const CssClampCalculator = () => {
  const [minSize, setMinSize] = useState("16");
  const [maxSize, setMaxSize] = useState("24");
  const [minVW, setMinVW] = useState("320");
  const [maxVW, setMaxVW] = useState("1200");
  const [root, setRoot] = useState("16");
  const [ratio, setRatio] = useState("1.2");
  const [copied, setCopied] = useState(false);

  const min = num(minSize);
  const max = num(maxSize);
  const vwMin = num(minVW);
  const vwMax = num(maxVW);
  const rootSize = num(root) || 16;
  const scale = num(ratio) || 1.2;

  const valid =
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    Number.isFinite(vwMin) &&
    Number.isFinite(vwMax) &&
    min > 0 &&
    max > min &&
    vwMin > 0 &&
    vwMax > vwMin;

  const clampLine = useMemo(() => {
    if (!valid) return "";
    return `font-size: clamp(${round(min, 2)}px, ${preferredValue(min, max, vwMin, vwMax)}, ${round(max, 2)}px);`;
  }, [valid, min, max, vwMin, vwMax]);

  const ladder = useMemo(() => {
    if (!valid) return [];
    return STEPS.map((i) => {
      const stepMin = round(min * scale ** i, 2);
      const stepMax = round(max * scale ** i, 2);
      return {
        i,
        label: i === 0 ? "Base" : i > 0 ? `+${i}` : `${i}`,
        min: stepMin,
        max: stepMax,
        clamp: `font-size: clamp(${stepMin}px, ${preferredValue(stepMin, stepMax, vwMin, vwMax)}, ${stepMax}px);`,
        rem: `${round(stepMin / rootSize, 3)}rem → ${round(stepMax / rootSize, 3)}rem`,
      };
    });
  }, [valid, min, max, vwMin, vwMax, scale, rootSize]);

  const slopePercent = valid ? round(((max - min) / (vwMax - vwMin)) * 100, 3) : 0;

  const copy = async () => {
    if (!clampLine) return;
    try {
      await navigator.clipboard.writeText(clampLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const input =
    "w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2 font-mono text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-orange-500 transition-colors";
  const fieldLabel =
    "text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest";

  const fields: [string, string, (v: string) => void][] = [
    ["Min font size (px)", minSize, setMinSize],
    ["Max font size (px)", maxSize, setMaxSize],
    ["Min viewport (px)", minVW, setMinVW],
    ["Max viewport (px)", maxVW, setMaxVW],
    ["Root font size (px)", root, setRoot],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {fields.map(([label, value, setter]) => (
          <label key={label} className="flex flex-col gap-1.5">
            <span className={fieldLabel}>{label}</span>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className={input}
            />
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <span className={fieldLabel}>Type scale ratio</span>
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2 text-sm text-slate-800 dark:text-gray-200 outline-none focus:border-orange-500"
        >
          {RATIOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      {!valid && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Enter a max font size larger than the min, and a max viewport larger
          than the min.
        </div>
      )}

      {valid && (
        <>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={fieldLabel}>Your clamp() value</span>
              <button
                onClick={copy}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="block font-mono text-sm sm:text-[15px] text-orange-500 break-all">
              {clampLine}
            </code>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500 dark:text-gray-400">
              <div>
                <span className="block text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  Slope
                </span>
                {slopePercent}vw per px
              </div>
              <div>
                <span className="block text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  At {vwMin}px
                </span>
                {round(min, 2)}px
              </div>
              <div>
                <span className="block text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  At {vwMax}px
                </span>
                {round(max, 2)}px
              </div>
              <div>
                <span className="block text-slate-400 dark:text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  Range
                </span>
                {round(min / rootSize, 3)}rem → {round(max / rootSize, 3)}rem
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  <th className="py-2 pr-4">Step</th>
                  <th className="py-2 pr-4">Min → Max</th>
                  <th className="py-2 pr-4">clamp()</th>
                  <th className="py-2">rem</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px] text-slate-600 dark:text-gray-400">
                {ladder.map((row) => (
                  <tr
                    key={row.i}
                    className="border-t border-slate-100 dark:border-white/5"
                  >
                    <td className="py-2 pr-4 font-bold text-slate-700 dark:text-gray-300">
                      {row.label}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {row.min}px → {row.max}px
                    </td>
                    <td className="py-2 pr-4 text-orange-500 break-all">
                      {row.clamp}
                    </td>
                    <td className="py-2 whitespace-nowrap">{row.rem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="border-t border-slate-100 dark:border-white/5 pt-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          How the CSS Clamp Calculator works
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          <code className="font-mono text-[12px] text-orange-500">
            clamp(min, preferred, max)
          </code>{" "}
          takes three parameters: a floor, a preferred value that scales with the
          viewport, and a ceiling. This calculator turns your min/max font sizes
          and viewport widths into the preferred{" "}
          <code className="font-mono text-[12px] text-orange-500">calc()</code>{" "}
          expression, then generates a full fluid type scale — every step gets
          its own ready-to-paste clamp() line in px and rem.
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          One line replaces the media queries you would otherwise write for
          mobile, tablet and desktop: text stays {round(min, 2)}px at{" "}
          {vwMin}px and below, grows linearly, and stops at {round(max, 2)}px
          once the viewport passes {vwMax}px.
        </p>
      </div>
    </div>
  );
};

export default CssClampCalculator;
