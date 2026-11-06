"use client";

import { useMemo, useState } from "react";

/**
 * CSV → Markdown table generator.
 *
 * Single component, zero dependencies: everything runs in the browser.
 * The parser is a small RFC-4180-ish state machine that handles quoted
 * fields, escaped quotes (""), embedded commas and line breaks.
 */

const MAX_INPUT_BYTES = 1_000_000; // warn past ~1MB, per selection doc

const DELIMITERS = [
  { value: "auto", label: "Auto-detect" },
  { value: ",", label: "Comma ," },
  { value: "\t", label: "Tab" },
  { value: ";", label: "Semicolon ;" },
  { value: "|", label: "Pipe |" },
] as const;

const EXAMPLE = `name,role,location
Alice,Engineer,"Berlin, Germany"
Bob,Designer,"New York, NY"`;

function detectDelimiter(text: string): string {
  const candidates = [",", "\t", ";", "|"];
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  let best = ",";
  let bestCount = 0;
  for (const d of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < firstLine.length; i++) {
      const c = firstLine[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === d && !inQuotes) count++;
    }
    if (count > bestCount) {
      best = d;
      bestCount = count;
    }
  }
  return best;
}

function parseCsv(input: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (c === "\r") {
      if (input[i + 1] === "\n") {
        continue; // CRLF: let the "\n" end the record
      }
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (field !== "" || row.length > 1 || rows.length === 0) rows.push(row);

  // Drop rows that are completely empty (blank lines between records).
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

function escapeCell(value: string): string {
  return value.replace(/\r?\n/g, "<br>").replace(/\|/g, "\\|").trim();
}

function toMarkdown(rows: string[][], hasHeader: boolean): string {
  if (rows.length === 0) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const cells = rows.map((r) => {
    const out = r.map(escapeCell);
    while (out.length < width) out.push("");
    return out;
  });

  const header = hasHeader
    ? cells[0]
    : Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
  const body = hasHeader ? cells.slice(1) : cells;
  const line = (r: string[]) => `| ${r.join(" | ")} |`;

  return [
    line(header),
    `| ${Array(width).fill("---").join(" | ")} |`,
    ...body.map(line),
  ].join("\n");
}

const CsvToMarkdown = () => {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<string>("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [copied, setCopied] = useState(false);

  const resolvedDelimiter = useMemo(
    () => (delimiter === "auto" ? detectDelimiter(input) : delimiter),
    [input, delimiter],
  );

  const rows = useMemo(
    () => (input.trim() ? parseCsv(input, resolvedDelimiter) : []),
    [input, resolvedDelimiter],
  );

  const markdown = useMemo(
    () => (rows.length > 0 ? toMarkdown(rows, hasHeader) : ""),
    [rows, hasHeader],
  );

  const columnCount = rows.reduce((max, r) => Math.max(max, r.length), 0);
  const tooLarge = input.length > MAX_INPUT_BYTES;

  const copy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — user can select the output manually */
    }
  };

  const download = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const label =
    "text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest";
  const button =
    "px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-orange-500 hover:text-orange-500 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className="flex flex-col gap-5">
      {tooLarge && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Input is over 1 MB — very large tables may take a moment to convert.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={label}>CSV input</span>
            <div className="flex gap-2">
              <button className={button} onClick={() => setInput(EXAMPLE)}>
                Example
              </button>
              <button
                className={button}
                onClick={() => setInput("")}
                disabled={!input}
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={"name,role,location\nAlice,Engineer,\"Berlin, Germany\""}
            className="w-full h-64 resize-y rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 p-3 font-mono text-[13px] leading-relaxed text-slate-700 dark:text-gray-300 outline-none focus:border-orange-500 transition-colors"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-gray-400">
            <label className="flex items-center gap-1.5">
              <span className="text-slate-400 dark:text-gray-500">Delimiter</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1 text-xs outline-none focus:border-orange-500"
              >
                {DELIMITERS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="accent-orange-500"
              />
              First row is header
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={label}>
              Markdown output
              {rows.length > 0 && (
                <span className="ml-2 text-orange-500 normal-case font-mono">
                  {rows.length}×{columnCount}
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <button className={button} onClick={copy} disabled={!markdown}>
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                className={`${button} bg-slate-800 dark:bg-white/10 text-white border-transparent hover:text-white hover:border-orange-500`}
                onClick={download}
                disabled={!markdown}
              >
                Download .md
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={markdown}
            placeholder="The generated Markdown table appears here…"
            className="w-full h-64 resize-y rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3 font-mono text-[13px] leading-relaxed text-slate-700 dark:text-gray-300 outline-none focus:border-orange-500 transition-colors"
          />
          <div className="text-xs text-slate-400 dark:text-gray-500">
            Paste it into GitHub, GitLab, Reddit, Notion or any Markdown editor.
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/5 pt-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          How the CSV to Markdown Table Generator works
        </h2>
        <ol className="mt-3 list-decimal list-inside space-y-1.5 text-sm text-slate-600 dark:text-gray-400">
          <li>
            Paste CSV data — or copy cells straight from Excel or Google Sheets
            and paste them here (tab-separated input is detected automatically).
          </li>
          <li>
            The generator parses quoted fields, commas inside cells and line
            breaks, then builds a valid GitHub-flavoured Markdown table.
          </li>
          <li>
            Copy the result to your clipboard or download it as a{" "}
            <code className="font-mono text-[12px] text-orange-500">
              .md
            </code>{" "}
            file.
          </li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          This free CSV to Markdown converter runs entirely in your browser:
          nothing is uploaded, no sign-up, no watermarks — and the same engine
          turns TSV exports and semicolon-separated CSV into a clean Markdown
          table you can paste anywhere.
        </p>
      </div>
    </div>
  );
};

export default CsvToMarkdown;
