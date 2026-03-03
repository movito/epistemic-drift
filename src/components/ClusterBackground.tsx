import type { ClusterData, NodeData } from "../lib/types";
import { getClusterBounds } from "../lib/geometry";

interface ClusterBackgroundProps {
  clusterKey: string;
  cluster: ClusterData;
  nodes: NodeData[];
}

export default function ClusterBackground({
  clusterKey,
  cluster,
  nodes,
}: ClusterBackgroundProps) {
  const bounds = getClusterBounds(clusterKey, nodes);
  if (!bounds || !cluster.label) return null;

  return (
    <g>
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        rx={16}
        ry={16}
        fill={cluster.fill}
        stroke={cluster.color}
        strokeWidth={1}
        strokeOpacity={0.2}
      />
      {cluster.labelPos && (
        <text
          x={cluster.labelPos.x}
          y={cluster.labelPos.y}
          fill={cluster.color}
          fontSize={11}
          fontWeight={600}
          fontFamily="var(--font-body)"
          opacity={0.7}
        >
          {cluster.label}
        </text>
      )}
    </g>
  );
}
