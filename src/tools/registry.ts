/**
 * Tool registry — the single source of truth for every tool on the site.
 *
 * This file must stay free of React component imports so it can be consumed
 * by `sitemap.ts`, `generateMetadata` and the homepage without pulling the
 * whole component graph into the build.
 *
 * To add a tool:
 *   1. create `src/tools/<slug>/index.tsx` (the component)
 *   2. add an entry to `tools` below
 *   3. register the component in `src/tools/map.tsx`
 */

export type ToolCategory = "fun" | "dev" | "time" | "text" | "image";

export type ToolStatus = "draft" | "live";

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolMeta {
  /** URL segment: /tools/<slug> */
  slug: string;
  /** Page H1 and <title> core */
  title: string;
  /** Meta description, card copy and intro paragraph */
  description: string;
  keywords: string[];
  category: ToolCategory;
  /** Emoji rendered in the tool card icon slot */
  icon: string;
  /** `draft` tools are hidden from the homepage, index and sitemap */
  status: ToolStatus;
  faq?: ToolFaq[];
  /** Slugs of related tools, used for internal linking */
  related?: string[];
}

export const SITE = {
  name: "cigol.dev",
  url: "https://cigol.dev",
  tagline: "Free Online Developer Tools",
  description:
    "Free, fast, browser-based tools for developers, designers and researchers. No sign-up, no upload, everything runs locally in your browser.",
} as const;

export const tools: ToolMeta[] = [
  {
    slug: "csv-to-markdown",
    title: "CSV to Markdown Table Generator",
    description:
      "Free CSV to Markdown table generator. Paste CSV or Excel data and get a GitHub-ready Markdown table instantly — copy or download, all in your browser.",
    keywords: [
      "csv to markdown table generator",
      "csv to markdown converter",
      "csv to markdown online",
      "convert csv to markdown",
      "csv to table markdown",
      "markdown table generator",
      "excel to markdown table",
      "csv to md",
    ],
    category: "dev",
    icon: "📋",
    status: "live",
    related: ["css-clamp-calculator"],
    faq: [
      {
        q: "Can I paste data straight from Excel or Google Sheets?",
        a: "Yes. Copy any range of cells and paste it into the input — the tool detects tab-separated data automatically and converts it into a Markdown table. Semicolon-separated CSV exports are handled too.",
      },
      {
        q: "How does it handle commas inside a cell?",
        a: "The parser is quote-aware (RFC 4180 style). Fields wrapped in double quotes may contain commas, escaped quotes (\"\") and line breaks, and they stay in a single table cell. Any pipe character in a cell is escaped so your table does not break.",
      },
      {
        q: "Is there a limit on how big the table can be?",
        a: "Tables up to about 1 MB convert instantly, which covers nearly every table people paste. Larger inputs still work but may take a moment — the tool shows a warning when you pass that size.",
      },
      {
        q: "Is my CSV uploaded anywhere?",
        a: "No. This CSV to Markdown converter runs entirely in your browser. Your data never leaves your device, nothing is stored, and no account is required.",
      },
    ],
  },
  {
    slug: "css-clamp-calculator",
    title: "CSS Clamp Calculator",
    description:
      "Free CSS clamp() calculator and fluid type scale generator. Enter min/max font size and viewport widths, get a ready-to-paste clamp() value in px and rem.",
    keywords: [
      "css clamp calculator",
      "css clamp generator",
      "css font size clamp",
      "clamp css",
      "fluid type scale generator",
      "css fluid font size",
      "fluid typography calculator",
      "clamp generator",
    ],
    category: "dev",
    icon: "📐",
    status: "live",
    related: ["csv-to-markdown"],
    faq: [
      {
        q: "What do the three clamp() parameters mean?",
        a: "clamp(min, preferred, max): min is the smallest allowed value, max is the largest, and preferred is the ideal value that scales with the viewport — here a calc() expression mixing vw and px. Below the min viewport the value floors at min; above the max viewport it caps at max.",
      },
      {
        q: "Should I use clamp() or media queries for fluid typography?",
        a: "For a single element that should scale continuously, clamp() is simpler and needs one line instead of several media query breakpoints. Media queries are still better when you want discrete jumps, per-breakpoint layout changes or values that must not scale at all.",
      },
      {
        q: "Do all browsers support CSS clamp()?",
        a: "clamp() works in all modern browsers (Chrome 79+, Firefox 75+, Safari 13.1+, Edge 79+). It does not work in Internet Explorer, so ship it as progressive enhancement: declare a static font-size first, then override it with the clamp() line — old browsers keep the static value.",
      },
      {
        q: "Is this clamp generator free to use?",
        a: "Yes. The CSS clamp calculator runs entirely in your browser, is free with no sign-up, and you can copy as many values as you like.",
      },
    ],
  },
  {
    slug: "image-compress-under-100kb",
    title: "Compress Image Under 100KB",
    description:
      "Free tool to compress an image under 100KB. Shrink JPG, PNG or WebP files below 100 KB while keeping quality — runs in your browser, nothing is uploaded.",
    keywords: [
      "compress image under 100kb",
      "compress image under 100kb online",
      "image compressor 100kb",
      "compress photo under 100kb",
      "reduce image size to 100kb",
      "jpg to 100kb compressor",
      "png compressor under 100kb",
      "compress image below 100kb free",
    ],
    category: "image",
    icon: "🗜️",
    status: "live",
    related: ["youtube-thumbnail-compressor", "etsy-listing-image-resizer"],
    faq: [
      {
        q: "Will compressing an image to 100KB make it look blurry?",
        a: "For photos at typical web sizes the difference is usually hard to notice. The tool lowers quality only as far as needed and only reduces pixel dimensions when quality alone cannot reach the target, so it keeps as much sharpness as 100KB allows.",
      },
      {
        q: "Which image formats are supported?",
        a: "Anything your browser can display: JPG, PNG and WebP. PNG files keep their transparency when they fit the target size; if they cannot, they are converted to JPG with the background flattened to white — the tool tells you when that happens.",
      },
      {
        q: "Is my image uploaded to a server?",
        a: "No. Compression happens locally with the browser's canvas API. Your file never leaves your device, nothing is stored and no account is required.",
      },
      {
        q: "Why do so many forms require images under 100KB?",
        a: "Resume portals, job applications, exam registrations, passport photo uploads and helpdesk systems cap file sizes at 100KB (or 100 KB per image) to keep their storage and review pipelines light. This tool targets exactly that limit.",
      },
    ],
  },
  {
    slug: "youtube-thumbnail-compressor",
    title: "YouTube Thumbnail Compressor Under 2MB",
    description:
      "Free YouTube thumbnail compressor. Shrink your cover image under YouTube's 2MB limit and fit it to 1280×720 — local processing, no upload, no sign-up.",
    keywords: [
      "youtube thumbnail compressor",
      "youtube thumbnail compressor under 2mb",
      "compress thumbnail for youtube",
      "youtube thumbnail size compressor",
      "compress image for youtube thumbnail",
      "youtube cover compressor free",
      "thumbnail 2mb compressor",
      "1280x720 image compressor",
    ],
    category: "image",
    icon: "🎬",
    status: "live",
    related: ["image-compress-under-100kb", "etsy-listing-image-resizer"],
    faq: [
      {
        q: "How large can a YouTube thumbnail be?",
        a: "YouTube rejects thumbnails over 2MB. This compressor targets just under 2 MB (1950 KB) so the file passes under either the 2,000,000-byte or 2 MiB interpretation of the limit.",
      },
      {
        q: "Should my thumbnail be 1280×720 or 1920×1080?",
        a: "1280×720 is YouTube's recommended thumbnail resolution — it matches the 16:9 player and is what you should upload. This tool scales larger images down to fit 1280×720 without changing the aspect ratio; smaller images are kept at their original size.",
      },
      {
        q: "Will YouTube compress my thumbnail again after upload?",
        a: "YouTube re-encodes every image it stores, so some quality loss always happens. Uploading a file that is already close to the target size and correct dimensions gives the encoder the best starting point.",
      },
    ],
  },
  {
    slug: "etsy-listing-image-resizer",
    title: "Etsy Listing Image Resizer — 2000×2000",
    description:
      "Free Etsy listing image resizer. Convert any photo to Etsy's recommended 2000×2000 main image — center on white or crop to fill, JPG or PNG, all in your browser.",
    keywords: [
      "etsy listing image resizer",
      "etsy listing image size",
      "etsy listing photo size",
      "etsy main image 2000x2000",
      "etsy image dimensions",
      "etsy product photo resizer",
      "etsy listing image ratio",
      "resize image for etsy",
    ],
    category: "image",
    icon: "🛍️",
    status: "live",
    related: ["image-compress-under-100kb", "youtube-thumbnail-compressor"],
    faq: [
      {
        q: "What size should Etsy listing images be?",
        a: "Etsy recommends a square main image of at least 2000×2000 pixels with a shortest side of 1000px or more, which enables the zoom feature on listing photos. This resizer outputs an exact 2000×2000 image.",
      },
      {
        q: "Should I center the product on white or crop to fill?",
        a: "Center on white keeps the whole photo visible and suits products that need breathing room — jewelry, prints, shoes. Crop to fill removes borders entirely and works well for full-bleed lifestyle shots. Try both and compare your click-through rate.",
      },
      {
        q: "Does resizing change my image quality?",
        a: "Scaling down from a larger photo is very sharp. Upscaling a small photo adds pixels but not detail, so start with the largest photo you have. JPG output uses high quality; choose PNG if your photo needs a transparent background.",
      },
      {
        q: "Are my Etsy photos uploaded anywhere?",
        a: "No. The resizer runs entirely in your browser on a local canvas — your images are never uploaded or stored.",
      },
    ],
  },
  {
    slug: "cube",
    title: "Rubik's Cube",
    description:
      "Play with a 3D Rubik's Cube in your browser. Twist layers with buttons or keyboard shortcuts, scramble it, then watch it auto-solve move by move.",
    keywords: [
      "rubiks cube",
      "rubik's cube simulator",
      "3d cube game",
      "cube solver",
      "online rubiks cube",
      "rubiks cube auto solve",
    ],
    category: "fun",
    icon: "🧊",
    status: "live",
    faq: [
      {
        q: "How do I control the cube?",
        a: "Use the U, D, L, R, F and B buttons, or press the matching key on your keyboard. Hold Shift for a counter-clockwise turn, and press Ctrl/Cmd + Z to undo your last move.",
      },
      {
        q: "What does Auto Solve do?",
        a: "Auto Solve rewinds every move you have made, in reverse order, until the cube returns to its original state. It is a move-by-move undo, not a general purpose solver for arbitrary cube states.",
      },
      {
        q: "Does this tool send my data anywhere?",
        a: "No. The cube runs entirely in your browser. Nothing is uploaded and no account is required.",
      },
    ],
  },
];

/** Tools that are published and should be indexed. */
export const liveTools: ToolMeta[] = tools.filter((tool) => tool.status === "live");

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(tool: ToolMeta): ToolMeta[] {
  const related = tool.related ?? [];
  return liveTools.filter((t) => t.slug !== tool.slug && related.includes(t.slug));
}
