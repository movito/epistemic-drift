import { toSvg, toBlob } from "html-to-image";
import type { NodeData } from "./types";

/** Serialize exports so concurrent calls don't race. */
let exportQueue: Promise<void> = Promise.resolve();

function runSerially(task: () => Promise<void>): Promise<void> {
  const run = exportQueue.then(task, task);
  exportQueue = run.then(() => undefined, () => undefined);
  return run;
}

/**
 * Clone the SVG offscreen with pan/zoom reset.
 * The clone stays in the DOM so CSS custom properties resolve via
 * getComputedStyle, but is invisible to the user.
 */
function cloneOffscreen(svgElement: SVGSVGElement): SVGSVGElement {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "-9999px";
  clone.style.width = "1020px";
  clone.style.height = "760px";
  document.body.appendChild(clone);

  const outerG = clone.querySelector("g[data-canvas]");
  if (outerG) outerG.removeAttribute("transform");

  return clone;
}

/**
 * Export the SVG element as a downloadable .svg file.
 * Uses html-to-image to resolve CSS custom properties and embed fonts.
 */
export function exportSVG(svgElement: SVGSVGElement): Promise<void> {
  return runSerially(async () => {
    const clone = cloneOffscreen(svgElement);

    try {
      const dataUrl = await toSvg(clone as unknown as HTMLElement, {
        width: 1020,
        height: 760,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "epistemic-map.svg";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      clone.remove();
    }
  });
}

/**
 * Export the SVG element as a downloadable .png file at 2x resolution.
 * Uses html-to-image to resolve CSS custom properties and embed fonts.
 */
export function exportPNG(svgElement: SVGSVGElement): Promise<void> {
  return runSerially(async () => {
    const clone = cloneOffscreen(svgElement);

    try {
      const blob = await toBlob(clone as unknown as HTMLElement, {
        width: 1020,
        height: 760,
        pixelRatio: 2,
      });

      if (!blob) {
        throw new Error("PNG export failed: renderer returned an empty blob");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "epistemic-map.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } finally {
      clone.remove();
    }
  });
}

/**
 * Dump current node positions as JSON to the console.
 */
export function dumpPositions(nodes: NodeData[]): void {
  const positions = nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
  console.log(JSON.stringify(positions, null, 2));
}
