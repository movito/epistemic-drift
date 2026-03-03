import { useRef, useCallback, type ReactNode } from "react";
import type { ViewTransform } from "../lib/types";

interface CanvasProps {
  transform: ViewTransform;
  onTransformChange: (transform: ViewTransform) => void;
  onBackgroundClick: () => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  children: ReactNode;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;

export default function Canvas({
  transform,
  onTransformChange,
  onBackgroundClick,
  svgRef,
  children,
}: CanvasProps) {
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, transform.scale * zoomFactor)
      );

      // Zoom centered on cursor position
      const scaleChange = newScale / transform.scale;
      const newX = mouseX - (mouseX - transform.x) * scaleChange;
      const newY = mouseY - (mouseY - transform.y) * scaleChange;

      onTransformChange({ x: newX, y: newY, scale: newScale });
    },
    [transform, onTransformChange, svgRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only start panning on direct SVG/background clicks
      if ((e.target as SVGElement).closest("g[data-node]")) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [transform.x, transform.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning.current) return;
      onTransformChange({
        ...transform,
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    },
    [transform, onTransformChange]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Deselect when clicking on empty canvas
      if (
        e.target === svgRef.current ||
        (e.target as SVGElement).tagName === "rect"
      ) {
        onBackgroundClick();
      }
    },
    [svgRef, onBackgroundClick]
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1020 760"
      style={{
        width: "100%",
        height: "100vh",
        display: "block",
        background: "var(--color-bg)",
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--color-text)" opacity={0.4} />
        </marker>
      </defs>
      <g
        data-canvas
        transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
      >
        {children}
      </g>
    </svg>
  );
}
