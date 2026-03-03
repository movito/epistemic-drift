import type { NodeData } from "./types";

/**
 * Export the SVG element as a downloadable .svg file.
 * Strips pan/zoom transform and sets explicit dimensions.
 */
export function exportSVG(svgElement: SVGSVGElement): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Remove pan/zoom transform from outer <g>
  const outerG = clone.querySelector("g[data-canvas]");
  if (outerG) {
    outerG.removeAttribute("transform");
  }

  // Set explicit dimensions
  clone.setAttribute("width", "1020");
  clone.setAttribute("height", "760");

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "epistemic-map.svg";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export the SVG element as a downloadable .png file at 2x resolution.
 */
export function exportPNG(svgElement: SVGSVGElement): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  const outerG = clone.querySelector("g[data-canvas]");
  if (outerG) {
    outerG.removeAttribute("transform");
  }

  const width = 1020;
  const height = 760;
  const scale = 2;

  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "epistemic-map.png";
      a.click();
      URL.revokeObjectURL(pngUrl);
    });
  };
  img.src = url;
}

/**
 * Dump current node positions as JSON to the console.
 */
export function dumpPositions(nodes: NodeData[]): void {
  const positions = nodes.map((n) => ({ id: n.id, x: n.x, y: n.y }));
  console.log(JSON.stringify(positions, null, 2));
}
