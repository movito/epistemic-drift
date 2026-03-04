interface ExportControlsProps {
  onExportSVG: () => void;
  onExportPNG: () => void;
  onDumpPositions: () => void;
}

const buttonStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 11,
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  cursor: "pointer",
  transition: "all var(--transition-fast)",
};

export default function ExportControls({
  onExportSVG,
  onExportPNG,
  onDumpPositions,
}: ExportControlsProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        gap: 8,
        zIndex: 10,
      }}
    >
      <button type="button" className="export-btn" style={buttonStyle} onClick={onExportSVG} title="Export SVG (S)">
        SVG
      </button>
      <button type="button" className="export-btn" style={buttonStyle} onClick={onExportPNG} title="Export PNG (P)">
        PNG
      </button>
      <button
        type="button"
        className="export-btn"
        style={buttonStyle}
        onClick={onDumpPositions}
        title="Dump positions (D)"
      >
        Positions
      </button>
    </div>
  );
}
