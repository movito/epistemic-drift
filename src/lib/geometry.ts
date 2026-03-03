import type { NodeData, EdgeData, ClusterData } from "./types";

/**
 * Calculate the start/end points for an edge line, offset by node radii
 * so lines connect at the circle perimeter rather than the center.
 */
export function getEdgePath(
  from: NodeData,
  to: NodeData
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) {
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  }

  const ux = dx / dist;
  const uy = dy / dist;

  return {
    x1: from.x + ux * from.radius,
    y1: from.y + uy * from.radius,
    x2: to.x - ux * to.radius,
    y2: to.y - uy * to.radius,
  };
}

/**
 * Calculate the midpoint of an edge for label positioning.
 */
export function getEdgeMidpoint(
  from: NodeData,
  to: NodeData
): { x: number; y: number } {
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

/**
 * Calculate a bounding box for a cluster based on its member nodes,
 * with padding for the rounded-rect background.
 */
export function getClusterBounds(
  clusterKey: string,
  nodes: NodeData[],
  padding = 40
): { x: number; y: number; width: number; height: number } | null {
  const members = nodes.filter((n) => n.cluster === clusterKey);
  if (members.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of members) {
    minX = Math.min(minX, node.x - node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
