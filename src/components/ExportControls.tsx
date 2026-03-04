interface ExportControlsProps {
  onExportSVG: () => void;
  onExportPNG: () => void;
  onDumpPositions: () => void;
}

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
      <button type="button" className="export-btn" onClick={onExportSVG} title="Export SVG (S)">
        SVG
      </button>
      <button type="button" className="export-btn" onClick={onExportPNG} title="Export PNG (P)">
        PNG
      </button>
      <button
        type="button"
        className="export-btn"
        onClick={onDumpPositions}
        title="Dump positions (D)"
      >
        Positions
      </button>
    </div>
  );
}
