/**
 * Maps tool slugs to their components.
 *
 * Kept separate from `registry.ts` so that metadata consumers (sitemap,
 * generateMetadata) never pull client components into their module graph.
 */
import type { ComponentType } from "react";
import Cube from "./cube";
import CsvToMarkdown from "./csv-to-markdown";
import CssClampCalculator from "./css-clamp-calculator";
import ImageCompressUnder100kb from "./image-compress-under-100kb";
import YouTubeThumbnailCompressor from "./youtube-thumbnail-compressor";
import EtsyListingImageResizer from "./etsy-listing-image-resizer";

export const toolComponents: Record<string, ComponentType> = {
  cube: Cube,
  "csv-to-markdown": CsvToMarkdown,
  "css-clamp-calculator": CssClampCalculator,
  "image-compress-under-100kb": ImageCompressUnder100kb,
  "youtube-thumbnail-compressor": YouTubeThumbnailCompressor,
  "etsy-listing-image-resizer": EtsyListingImageResizer,
};

export function getToolComponent(slug: string): ComponentType | undefined {
  return toolComponents[slug];
}
