import type { NodeData, EdgeData } from "../lib/types";
import { getEdgePath, getEdgeMidpoint } from "../lib/geometry";

interface EdgeProps {
  edge: EdgeData;
  fromNode: NodeData;
  toNode: NodeData;
  dimmed: boolean;
  highlighted: boolean;
}

const STROKE_DASHARRAY: Record<string, string | undefined> = {
  solid: undefined,
  dashed: "8 4",
  dotted: "3 3",
};

export default function Edge({
  edge,
  fromNode,
  toNode,
  dimmed,
  highlighted,
}: EdgeProps) {
  const { x1, y1, x2, y2 } = getEdgePath(fromNode, toNode);
  const mid = getEdgeMidpoint(fromNode, toNode);
  const dashArray = STROKE_DASHARRAY[edge.style || "solid"];

  const opacity = dimmed ? 0.1 : highlighted ? 1 : 0.4;

  return (
    <g style={{ transition: "opacity var(--transition-fast)" }}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--color-text)"
        strokeWidth={highlighted ? 1.5 : 1}
        strokeDasharray={dashArray}
        opacity={opacity}
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <text
          x={mid.x}
          y={mid.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          fill="var(--color-text-secondary)"
          fontFamily="var(--font-body)"
          opacity={dimmed ? 0.1 : 0.8}
          style={{ pointerEvents: "none" }}
        >
          {edge.label.split("\n").map((line, i, arr) => (
            <tspan
              key={i}
              x={mid.x}
              dy={i === 0 ? `${-(arr.length - 1) * 0.5}em` : "1.1em"}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}
