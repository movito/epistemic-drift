import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
} from "react";
import type { GraphData, NodeData, ViewTransform } from "../lib/types";
import { exportSVG, exportPNG, dumpPositions } from "../lib/export";
import { getClusterBounds, getEdgeLabelPoint } from "../lib/geometry";
import Canvas from "./Canvas";
import ClusterBackground from "./ClusterBackground";
import Edge from "./Edge";
import Node from "./Node";
import DetailPanel from "./DetailPanel";
import ExportControls from "./ExportControls";
import graphData from "../data/graph.json";

const data = graphData as GraphData;

export default function ConceptMap() {
  const [nodes, setNodes] = useState<NodeData[]>(data.nodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transform, setTransform] = useState<ViewTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);

  // Fibonacci-ratio type scale: 8:13:21 → edge:node:cluster
  // Node font is the anchor, computed from measurement.
  // Edge = node × 8/13, Cluster = node × 21/13
  const [typeScale, setTypeScale] = useState({
    node: 11,
    edge: Math.round((11 * 8) / 13 * 10) / 10,
    cluster: Math.round((11 * 21) / 13 * 10) / 10,
    centralNode: 14,
  });

  // Per-node font sizes (uniform for regular, independent for large)
  const [fontSizes, setFontSizes] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const n of data.nodes) {
      map.set(n.id, n.radius > 40 ? 14 : 11);
    }
    return map;
  });

  /**
   * Measure all labels and compute:
   * 1. Uniform font size for regular nodes (largest that fits the tightest circle)
   * 2. Independent font size for large (central) node
   * 3. Fibonacci-derived sizes for edges (8/13 × node) and clusters (21/13 × node)
   */
  const measureAndFit = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;

    const PADDING = 8;
    const BASE_FONT = 11;
    const LARGE_BASE_FONT = 14;
    const MIN_EDGE_FONT = 7;

    el.style.fontWeight = "500";
    el.style.fontFamily = "var(--font-body)";

    let minRegularScale = 1;
    const largeFontScales = new Map<string, number>();

    for (const n of data.nodes) {
      const isLarge = n.radius > 40;
      const baseFontSize = isLarge ? LARGE_BASE_FONT : BASE_FONT;

      el.style.fontSize = `${baseFontSize}px`;

      const lines = n.label.split("\n");
      let maxWidth = 0;
      for (const line of lines) {
        el.textContent = line;
        maxWidth = Math.max(maxWidth, el.getComputedTextLength());
      }

      const lineHeight = 1.2 * baseFontSize;
      const textHeight = (lines.length - 1) * lineHeight + baseFontSize;
      const halfW = maxWidth / 2;
      const halfH = textHeight / 2;
      const textBoundingR = Math.sqrt(halfW * halfW + halfH * halfH);
      const available = n.radius - PADDING;
      const scale = available / textBoundingR;

      if (isLarge) {
        largeFontScales.set(n.id, scale);
      } else {
        minRegularScale = Math.min(minRegularScale, scale);
      }
    }

    // Uniform font for regular nodes
    const nodeFont =
      Math.round(Math.min(1, minRegularScale) * BASE_FONT * 10) / 10;

    // Fibonacci scale: 8:13:21
    const edgeFont = Math.max(
      MIN_EDGE_FONT,
      Math.round((nodeFont * 8) / 13 * 10) / 10
    );
    const clusterFont = Math.round((nodeFont * 21) / 13 * 10) / 10;

    // Central node font (independent)
    let centralFont = LARGE_BASE_FONT;
    for (const [, scale] of largeFontScales) {
      centralFont = Math.round(Math.min(1, scale) * LARGE_BASE_FONT * 10) / 10;
    }

    setTypeScale({
      node: nodeFont,
      edge: edgeFont,
      cluster: clusterFont,
      centralNode: centralFont,
    });

    const newFontSizes = new Map<string, number>();
    for (const n of data.nodes) {
      newFontSizes.set(n.id, n.radius > 40 ? centralFont : nodeFont);
    }
    setFontSizes(newFontSizes);
  }, []);

  // Measure before first paint
  useLayoutEffect(() => {
    measureAndFit();
  }, [measureAndFit]);

  // Re-measure after fonts fully load
  useEffect(() => {
    document.fonts.ready.then(measureAndFit);
  }, [measureAndFit]);

  // Build a lookup for nodes by id
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  // Cluster title bounding rects for edge label collision avoidance
  const clusterTitleRects = useMemo(() => {
    const rects: { x: number; y: number; w: number; h: number }[] = [];
    const clusterFontSize = typeScale.cluster;

    for (const [key, cluster] of Object.entries(data.clusters)) {
      if (!cluster.label) continue;
      const labelHeight = clusterFontSize + 8;
      const bounds = getClusterBounds(key, nodes, 40, labelHeight);
      if (!bounds) continue;

      // Title is centered horizontally, near the top of the bounds
      const titleX = bounds.x + bounds.width / 2;
      const titleY = bounds.y + clusterFontSize + 12;
      // Approximate title width: ~0.6em per char at cluster font size
      const titleW = cluster.label.length * clusterFontSize * 0.6;
      const titleH = clusterFontSize * 1.4;

      rects.push({
        x: titleX - titleW / 2 - 4,
        y: titleY - titleH / 2 - 4,
        w: titleW + 8,
        h: titleH + 8,
      });
    }
    return rects;
  }, [nodes, typeScale.cluster]);

  // Compute edge label positions, avoiding cluster titles
  const edgeLabelPositions = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();

    for (let i = 0; i < data.edges.length; i++) {
      const edge = data.edges[i];
      if (!edge.label) continue;

      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) continue;

      // Try t values: prefer 0.5 (midpoint), then shift toward either end
      const candidates = [0.5, 0.4, 0.6, 0.3, 0.7, 0.25, 0.75];
      let bestPos = getEdgeLabelPoint(from, to, 0.5);

      for (const t of candidates) {
        const pos = getEdgeLabelPoint(from, to, t);
        const collides = clusterTitleRects.some(
          (r) =>
            pos.x >= r.x &&
            pos.x <= r.x + r.w &&
            pos.y >= r.y &&
            pos.y <= r.y + r.h
        );
        if (!collides) {
          bestPos = pos;
          break;
        }
      }

      positions.set(i, bestPos);
    }
    return positions;
  }, [nodeMap, clusterTitleRects]);

  // Determine which nodes are connected to the hovered/selected node
  const activeId = hoveredId || selectedId;
  const connectedIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    const connected = new Set<string>([activeId]);
    for (const edge of data.edges) {
      if (edge.from === activeId) connected.add(edge.to);
      if (edge.to === activeId) connected.add(edge.from);
    }
    return connected;
  }, [activeId]);

  const handleNodeSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
  }, []);

  const handleExportSVG = useCallback(() => {
    if (svgRef.current) exportSVG(svgRef.current);
  }, []);

  const handleExportPNG = useCallback(() => {
    if (svgRef.current) exportPNG(svgRef.current);
  }, []);

  const handleDumpPositions = useCallback(() => {
    dumpPositions(nodes);
  }, [nodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;

      switch (e.key.toLowerCase()) {
        case "d":
          dumpPositions(nodes);
          break;
        case "s":
          if (svgRef.current) exportSVG(svgRef.current);
          break;
        case "p":
          if (svgRef.current) exportPNG(svgRef.current);
          break;
        case "escape":
          setSelectedId(null);
          setTransform({ x: 0, y: 0, scale: 1 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes]);

  const selectedNode = selectedId ? nodeMap.get(selectedId) ?? null : null;
  const selectedCluster = selectedNode
    ? data.clusters[selectedNode.cluster] ?? null
    : null;

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Title */}
      <div
        style={{
          position: "fixed",
          top: 16,
          left: 24,
          zIndex: 10,
          fontFamily: "var(--font-body)",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(14px, 2.5vw, 20px)",
            fontWeight: 600,
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          {data.meta.title}
        </h1>
        <p
          style={{
            fontSize: "clamp(10px, 1.5vw, 12px)",
            color: "var(--color-text-muted)",
            marginTop: 4,
            maxWidth: "min(500px, 50vw)",
            lineHeight: 1.4,
          }}
        >
          {data.meta.subtitle}
        </p>
      </div>

      <ExportControls
        onExportSVG={handleExportSVG}
        onExportPNG={handleExportPNG}
        onDumpPositions={handleDumpPositions}
      />

      <Canvas
        transform={transform}
        onTransformChange={setTransform}
        onBackgroundClick={handleBackgroundClick}
        svgRef={svgRef}
      >
        {/* Cluster backgrounds */}
        {Object.entries(data.clusters).map(([key, cluster]) => (
          <ClusterBackground
            key={key}
            clusterKey={key}
            cluster={cluster}
            nodes={nodes}
            fontSize={typeScale.cluster}
          />
        ))}

        {/* Edges */}
        {data.edges.map((edge, i) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const isConnected =
            activeId != null &&
            (edge.from === activeId || edge.to === activeId);

          return (
            <Edge
              key={`${edge.from}-${edge.to}-${i}`}
              edge={edge}
              fromNode={fromNode}
              toNode={toNode}
              labelPos={edgeLabelPositions.get(i)}
              fontSize={typeScale.edge}
              dimmed={activeId != null && !isConnected}
              highlighted={isConnected}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            cluster={data.clusters[node.cluster]}
            fontSize={fontSizes.get(node.id) ?? 11}
            selected={selectedId === node.id}
            dimmed={activeId != null && !connectedIds.has(node.id)}
            highlighted={connectedIds.has(node.id)}
            onSelect={handleNodeSelect}
            onHoverStart={setHoveredId}
            onHoverEnd={() => setHoveredId(null)}
            onDrag={handleNodeDrag}
          />
        ))}

        {/* Hidden text element for measuring label widths */}
        <text
          ref={measureRef}
          style={{ visibility: "hidden" }}
          aria-hidden="true"
        />
      </Canvas>

      <DetailPanel node={selectedNode} cluster={selectedCluster} />

      {/* Keyboard hint */}
      <div
        style={{
          position: "fixed",
          bottom: selectedNode ? 80 : 16,
          right: 16,
          fontSize: 10,
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          transition: "bottom var(--transition-normal)",
        }}
      >
        {data.meta.note}
      </div>
    </div>
  );
}
