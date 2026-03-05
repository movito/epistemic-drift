import type { NodeData } from "../lib/types";

interface DetailPanelProps {
  node: NodeData | null;
  clusterColor: string | null;
}

export default function DetailPanel({ node, clusterColor }: DetailPanelProps) {
  if (!node || !clusterColor) return null;

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
        padding: "var(--space-lg) var(--space-xl)",
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
          gap: "var(--space-lg)",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "var(--size-indicator)",
            height: "var(--size-indicator)",
            borderRadius: "50%",
            background: clusterColor,
            flexShrink: 0,
            marginTop: "var(--space-xs)",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "clamp(12px, 1.8vw, 14px)",
              fontWeight: "var(--type-weight-semibold)",
              color: "var(--color-text)",
              marginBottom: "var(--space-xs)",
            }}
          >
            {node.label.replace(/\n/g, " ")}
          </div>
          <div
            style={{
              fontSize: "clamp(11px, 1.6vw, 13px)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--type-line-height-loose)",
            }}
          >
            {node.description}
          </div>
        </div>
      </div>
    </div>
  );
}
