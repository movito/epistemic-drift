import { useCallback, useRef } from "react";
import type { NodeData, ClusterData } from "../lib/types";

interface NodeProps {
  node: NodeData;
  cluster: ClusterData;
  selected: boolean;
  dimmed: boolean;
  highlighted: boolean;
  onSelect: (id: string) => void;
  onHoverStart: (id: string) => void;
  onHoverEnd: () => void;
  onDrag: (id: string, x: number, y: number) => void;
}

export default function Node({
  node,
  cluster,
  selected,
  dimmed,
  highlighted,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onDrag,
}: NodeProps) {
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
      (e.target as SVGElement).setPointerCapture(e.pointerId);
    },
    [node.x, node.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      e.stopPropagation();
      // We need to account for the current SVG transform (scale)
      // The parent ConceptMap will pass the inverse scale via CSS variable or we compute here
      onDrag(
        node.id,
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y
      );
    },
    [node.id, onDrag]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) {
        dragging.current = false;
        e.stopPropagation();
        // Only select if it wasn't a drag (small movement threshold)
      }
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id);
    },
    [node.id, onSelect]
  );

  const opacity = dimmed ? 0.15 : 1;
  const strokeWidth = selected ? 3 : highlighted ? 2 : 1.5;

  const lines = node.label.split("\n");

  return (
    <g
      style={{
        cursor: "grab",
        transition: "opacity var(--transition-fast)",
        opacity,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onMouseEnter={() => onHoverStart(node.id)}
      onMouseLeave={onHoverEnd}
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={node.radius}
        fill="var(--color-surface)"
        stroke={cluster.color}
        strokeWidth={strokeWidth}
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={node.radius > 40 ? 14 : 11}
        fontWeight={500}
        fontFamily="var(--font-body)"
        fill="var(--color-text)"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {lines.map((line, i) => (
          <tspan
            key={i}
            x={node.x}
            dy={i === 0 ? `${-(lines.length - 1) * 0.5}em` : "1.2em"}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}
