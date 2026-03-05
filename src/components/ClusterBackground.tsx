import type { ClusterData, NodeData } from "../lib/types";
import { getClusterBounds } from "../lib/geometry";

interface ClusterBackgroundProps {
  clusterKey: string;
  cluster: ClusterData;
  nodes: NodeData[];
  fontSize: number;
}

export default function ClusterBackground({
  clusterKey,
  cluster,
  nodes,
  fontSize,
}: ClusterBackgroundProps) {
  const labelHeight = cluster.label ? fontSize + 8 : 0;
  const bounds = getClusterBounds(clusterKey, nodes, 40, labelHeight);
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
      <text
        x={bounds.x + bounds.width / 2}
        y={bounds.y + fontSize + 12}
        textAnchor="middle"
        fill={cluster.color}
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="var(--font-body)"
        opacity={0.7}
      >
        {cluster.label}
      </text>
    </g>
  );
}
