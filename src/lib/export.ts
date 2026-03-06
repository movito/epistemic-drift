import { toSvg, toBlob } from "html-to-image";
import type { NodeData } from "./types";

/**
 * Export the SVG element as a downloadable .svg file.
 * Uses html-to-image to resolve CSS custom properties and embed fonts.
 */
export async function exportSVG(svgElement: SVGSVGElement): Promise<void> {
  const outerG = svgElement.querySelector("g[data-canvas]");
  const originalTransform = outerG?.getAttribute("transform") || "";
  if (outerG) outerG.removeAttribute("transform");

  try {
    const dataUrl = await toSvg(svgElement as unknown as HTMLElement, {
      width: 1020,
      height: 760,
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "epistemic-map.svg";
    a.click();
  } finally {
    if (outerG) outerG.setAttribute("transform", originalTransform);
  }
}

/**
 * Export the SVG element as a downloadable .png file at 2x resolution.
 * Uses html-to-image to resolve CSS custom properties and embed fonts.
 */
export async function exportPNG(svgElement: SVGSVGElement): Promise<void> {
  const outerG = svgElement.querySelector("g[data-canvas]");
  const originalTransform = outerG?.getAttribute("transform") || "";
  if (outerG) outerG.removeAttribute("transform");

  try {
    const blob = await toBlob(svgElement as unknown as HTMLElement, {
      width: 1020,
      height: 760,
      pixelRatio: 2,
    });

    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "epistemic-map.png";
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    if (outerG) outerG.setAttribute("transform", originalTransform);
  }
}

/**
 * Dump current node positions as JSON to the console.
 */
export function dumpPositions(nodes: NodeData[]): void {
  const positions = nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
  console.log(JSON.stringify(positions, null, 2));
}
