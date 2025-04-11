"use client";

import { useEffect, useState, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";

type GraphNode = {
  id: string;
  label: string;
  group: number;
  title?: string;
  size?: number;
  image?: string;
  shape?: string;
  color?: string | object;
};

type GraphEdge = {
  id?: string;
  from: string;
  to: string;
  width?: number;
  color?: string | object;
  dashes?: boolean | number[];
  length?: number;
  title?: string;
};

type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// Define position interface for type safety
interface NodePosition {
  x: number;
  y: number;
}

// Define positions type to allow indexing by string
interface NodePositions {
  [key: string]: NodePosition;
}

export default function TopInfluencersGraph() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const nodesDataSet = useRef<DataSet<any> | null>(null);
  const edgesDataSet = useRef<DataSet<any> | null>(null);
  const animationRef = useRef<number | null>(null);

  // Generate a hash color from string
  const stringToColor = (str: string) => {
    let hash = 2166136261; // FNV-1a 32-bit prime offset
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= 16777619; // FNV prime
    }

    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += value.toString(16).padStart(2, "0");
    }

    return color;
  };

  const nodeNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona"];

  // Create graph data with hexagonal layout
  const createHexagonalGraph = () => {
    const nodes: GraphNode[] = [
      {
        id: "central",
        label: "Maxxit Leaderboard",
        group: 1,
        title: `Top Weekly Influencer Leaderboard
        Period: Last 7 days
        Total Influencers: 6
        Metric: Profit (USD)`,
        size: 40,
        shape: "circularImage",
        image: "/img/maxxit_icon.svg",
        color: {
          background: "#f7f7f7",
          color: "#ffffff",
        },
      },
    ];

    const influencerData = [
      { name: "Alice", profit: 12345, trades: 120, roi: 15.2 },
      { name: "Bob", profit: 9540, trades: 98, roi: 12.8 },
      { name: "Charlie", profit: 8200, trades: 110, roi: 10.4 },
      { name: "Diana", profit: 7750, trades: 85, roi: 9.7 },
      { name: "Ethan", profit: 6300, trades: 72, roi: 8.1 },
      { name: "Fiona", profit: 5100, trades: 65, roi: 7.5 },
    ];

    const hexNodes: GraphNode[] = influencerData.map((inf, i) => ({
      id: `node-${i}`,
      label: inf.name,
      group: 2,
      title: `${inf.name}
      Total P/L: $${inf.profit.toLocaleString()}
      Trades: ${inf.trades}
      ROI: ${inf.roi}%`,
      size: 30,
      shape: "circularImage",
      image: `https://picsum.photos/id/${(i + 10) * 5}/200`,
    }));

    nodes.push(...hexNodes);

    // Create edges connecting:
    // 1. Central node to each hex node
    // 2. Each hex node to its neighbors in the hexagon
    const edges: GraphEdge[] = [];

    // Connect central to all influencers
    for (let i = 0; i < 6; i++) {
      edges.push({
        id: `central:node-${i}`,
        from: "central",
        to: `node-${i}`,
        width: 3,
        color: {
          color: stringToColor(influencerData[i].name),
          opacity: 0.8,
        },
        title: "Performance Link",
      });
    }

    // Connect each influencer to its neighbor
    for (let i = 0; i < 6; i++) {
      const nextNode = (i + 1) % 6;
      edges.push({
        id: `node-${i}:node-${nextNode}`,
        from: `node-${i}`,
        to: `node-${nextNode}`,
        width: 3,
        color: {
          color: "#ffffff",
          opacity: 0.7,
        },
        title: "Peer Comparison",
      });
    }

    return { nodes, edges };
  };

  // Initialize the graph
  useEffect(() => {
    const graphData = createHexagonalGraph();

    if (networkRef.current) {
      nodesDataSet.current = new DataSet(graphData.nodes);
      edgesDataSet.current = new DataSet(graphData.edges);

      const data = {
        nodes: nodesDataSet.current,
        edges: edgesDataSet.current,
      };

      const options = {
        nodes: {
          font: {
            size: 16,
            face: "Inter, system-ui, sans-serif",
            color: "#ffffff",
            strokeWidth: 1,
            strokeColor: "#000000",
          },
          borderWidth: 2,
          borderWidthSelected: 4,
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.5)",
            size: 10,
            x: 0,
            y: 0,
          },
          shapeProperties: {
            useBorderWithImage: true,
          },
        },
        edges: {
          smooth: false, // Changed to straight lines for signal animation
          selectionWidth: 3,
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.3)",
            size: 5,
            x: 0,
            y: 0,
          },
        },
        groups: {
          1: {
            color: {
              background: "#ff4d4f",
              border: "#ffffff",
              highlight: { background: "#ff7875", border: "#ffffff" },
            },
            fontColor: "#ffffff",
            borderWidth: 3,
          },
          2: {
            color: {
              border: "#ffffff",
              highlight: { background: "#91d5ff", border: "#ffffff" },
            },
            fontColor: "#ffffff",
            borderWidth: 2,
          },
        },
        layout: {
          improvedLayout: true,
          hierarchical: false,
        },
        physics: {
          // enabled: true,
          stabilization: {
            enabled: true,
            iterations: 100,
            updateInterval: 25,
            fit: true,
          },
          barnesHut: {
            gravitationalConstant: -4000,
            centralGravity: 0.3,
            springLength: 150,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.1,
          },
          maxVelocity: 50,
          minVelocity: 0.1,
          solver: "barnesHut",
          timestep: 0.3,
        },
        interaction: {
          hover: true,
          hoverConnectedEdges: true,
          tooltipDelay: 200,
          hideEdgesOnDrag: false,
          navigationButtons: false,
          keyboard: {
            enabled: true,
            bindToWindow: false,
          },
          zoomView: false,
          dragView: false,
          dragNodes: false,
        },
        height: "580px",
        width: "100%",
      };

      networkInstance.current = new Network(networkRef.current, data, options);

      // Event listeners
      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);
        } else {
          setSelectedNode(null);
        }
      });

      networkInstance.current.on("hoverNode", function (params) {
        networkRef.current?.style.setProperty("cursor", "pointer");
      });

      networkInstance.current.on("blurNode", function (params) {
        networkRef.current?.style.setProperty("cursor", "default");
      });

      // Position nodes in a hexagonal shape
      networkInstance.current.once("stabilizationIterationsDone", function () {
        // Calculate positions in a hexagon
        const radius = 250; // Radius of the hexagon
        const positions: NodePositions = {}; // Use the properly typed interface

        // Position the central node
        positions["central"] = { x: 0, y: 0 };

        // Position the other nodes in a hexagon
        for (let i = 0; i < 6; i++) {
          const angle = i * ((2 * Math.PI) / 6); // Divide circle into 6 parts
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          positions[`node-${i}`] = { x, y };
        }

        // Set the calculated positions
        networkInstance.current?.setOptions({
          physics: false, // Disable physics once positions are set
        });

        // Use moveNode instead of setPositions since setPositions doesn't exist
        Object.keys(positions).forEach((nodeId) => {
          const pos = positions[nodeId];
          if (networkInstance.current) {
            networkInstance.current.moveNode(nodeId, pos.x, pos.y);
          }
        });

        // Start the pulse animation after positions are set
        startPulseAnimation();

        // right after startPulseAnimation();
        startCentralPulse();

        // Fit the view
        setTimeout(() => {
          networkInstance.current?.fit({
            animation: {
              duration: 1000,
              easingFunction: "easeInOutQuad",
            },
          });
        }, 100);
      });
    }

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, []);

  // Pulse animation function with signal effect
  const startPulseAnimation = () => {
    const positions = networkInstance.current!.getPositions();
    const centralPos = positions["central"];
    const hexPositions: { [key: string]: NodePosition } = {};
    for (let i = 0; i < 6; i++) {
      hexPositions[`node-${i}`] = positions[`node-${i}`];
    }

    // Create temporary nodes for the signals
    const tempNodeIds: string[] = [];
    for (let i = 0; i < 6; i++) {
      const tempNodeId = `temp-${i}`;
      tempNodeIds.push(tempNodeId);
      nodesDataSet.current!.add({
        id: tempNodeId,
        x: centralPos.x,
        y: centralPos.y,
        label: "",
        size: 5,
        color: stringToColor(nodeNames[i]),
        shape: "dot",
        fixed: { x: true, y: true }, // Prevent physics interference
        shadow: {
          enabled: true,
          color: stringToColor(nodeNames[i]),
          size: 20,
          x: 0,
          y: 0,
        },
      });
    }

    const animationDuration = 2000; // 2 seconds for signal travel
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Update temporary node positions to simulate signal movement
      for (let i = 0; i < 6; i++) {
        const targetPos = hexPositions[`node-${i}`];
        const newX = centralPos.x + (targetPos.x - centralPos.x) * progress;
        const newY = centralPos.y + (targetPos.y - centralPos.y) * progress;
        nodesDataSet.current!.update({
          id: tempNodeIds[i],
          x: newX,
          y: newY,
        });
      }

      if (progress < 1) {
        // Continue animation
        animationRef.current = requestAnimationFrame(animate);
      } else {
        for (let i = 0; i < 6; i++) {
          nodesDataSet.current!.update({
            id: tempNodeIds[i],
            hidden: true,
          });
        }
        // Signal has reached all nodes, trigger glow effect
        for (let i = 0; i < 6; i++) {
          nodesDataSet.current!.update({
            id: `node-${i}`,
            shadow: {
              enabled: true,
              color: stringToColor(nodeNames[i]),
              size: 50,
              x: 0,
              y: 0,
            },
          });
        }

        // After a short delay, reset glow and restart animation
        setTimeout(() => {
          // Reset hexagon nodes' shadows
          for (let i = 0; i < 6; i++) {
            nodesDataSet.current!.update({
              id: `node-${i}`,
              shadow: {
                enabled: true,
                color: "rgba(0,0,0,0.5)",
                size: 10,
                x: 0,
                y: 0,
              },
            });
          }

          // Reset temporary nodes to central position
          for (let i = 0; i < 6; i++) {
            nodesDataSet.current!.update({
              id: tempNodeIds[i],
              x: centralPos.x,
              y: centralPos.y,
              hidden: false,
            });
          }

          // Restart animation
          startTime = Date.now();
          animationRef.current = requestAnimationFrame(animate);
        }, 1000); // 0.5-second glow duration
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Animate only the central node to 'breathe' its shadow & border
  const startCentralPulse = () => {
    let start = Date.now();
    const duration = 2000; // one full breath cycle in ms

    const animate = () => {
      const elapsed = Date.now() - start;
      // sine wave: sin(0→2π) maps to –1→1; normalize to 0→1
      const t = (Math.sin((elapsed / duration) * 2 * Math.PI) + 1) / 2;

      // Map t to shadow size (e.g. 10px → 60px) and borderWidth (2px → 6px)
      const shadowSize = 10 + t * 50;
      const borderWidth = 2 + t * 4;

      nodesDataSet.current!.update({
        id: "central",
        shadow: {
          enabled: true,
          color: stringToColor("Central"), // or stringToColor("Central") if you like
          size: shadowSize,
          x: 0,
          y: 0,
        },
        borderWidth,
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
        Top Weekly Influencers
      </h1>
      <p className="text-gray-300 mb-8">
        Visualizing top influencers by profit in the past week
      </p>

      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-6xl relative">
          <div
            ref={networkRef}
            className="w-full h-[600px] border border-gray-700 rounded-xl overflow-hidden bg-gray-800 bg-opacity-50 shadow-2xl"
          />
          <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 p-3 rounded-lg shadow-lg text-sm">
            <p className="font-medium mb-1">Network Legend</p>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div>
              <span>Maxxit Leaderboard</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span>Influencers</span>
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p>
              Selected:{" "}
              <span className="font-bold text-blue-400">
                {selectedNode === "central"
                  ? "Maxxit Leaderboard"
                  : selectedNode.replace("node-", "Node ")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
