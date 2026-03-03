import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { GraphData, NodeData, ViewTransform } from "../lib/types";
import { exportSVG, exportPNG, dumpPositions } from "../lib/export";
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

  // Build a lookup for nodes by id
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

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
            fontSize: 20,
            fontWeight: 600,
            color: "var(--color-text)",
            margin: 0,
          }}
        >
          {data.meta.title}
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginTop: 4,
            maxWidth: 500,
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
            selected={selectedId === node.id}
            dimmed={activeId != null && !connectedIds.has(node.id)}
            highlighted={connectedIds.has(node.id)}
            onSelect={handleNodeSelect}
            onHoverStart={setHoveredId}
            onHoverEnd={() => setHoveredId(null)}
            onDrag={handleNodeDrag}
          />
        ))}
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
