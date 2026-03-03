import type { NodeData, ClusterData } from "../lib/types";

interface DetailPanelProps {
  node: NodeData | null;
  cluster: ClusterData | null;
}

export default function DetailPanel({ node, cluster }: DetailPanelProps) {
  if (!node || !cluster) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        padding: "16px 24px",
        fontFamily: "var(--font-body)",
        zIndex: 10,
        animation: "slideUp 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: cluster.color,
            flexShrink: 0,
            marginTop: 4,
          }}
        />
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 4,
            }}
          >
            {node.label.replace(/\n/g, " ")}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {node.description}
          </div>
        </div>
      </div>
    </div>
  );
}
