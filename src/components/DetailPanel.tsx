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
        maxHeight: "40vh",
        overflowY: "auto",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        padding: "16px 24px",
        fontFamily: "var(--font-body)",
        zIndex: 10,
        animation: "slide-up 0.2s ease",
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
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "clamp(12px, 1.8vw, 14px)",
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 4,
            }}
          >
            {node.label.replace(/\n/g, " ")}
          </div>
          <div
            style={{
              fontSize: "clamp(11px, 1.6vw, 13px)",
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
