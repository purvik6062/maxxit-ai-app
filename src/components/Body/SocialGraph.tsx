"use client";

import { useEffect, useState, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";
import { Tooltip } from "react-tooltip";
import { useSession } from "next-auth/react";
import { useCredits } from "@/context/CreditsContext";
import { Loader2 } from "lucide-react";

type SubscribedAccount = {
  twitterHandle: string;
  subscriptionDate: string;
  expiryDate: string;
  userProfileUrl: string;
};

type GraphNode = {
  id: string;
  label: string;
  group: number;
  title?: string;
  size?: number;
  image?: string;
  shape?: string;
};

type GraphEdge = {
  from: string;
  to: string;
  width?: number;
  color?: string | object;
  dashes?: boolean | number[];
  length?: number;
};

type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export default function SubscribedAccountsPage() {
  const { data: session } = useSession();
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const nodesDataSet = useRef<DataSet<any> | null>(null);
  const edgesDataSet = useRef<DataSet<any> | null>(null);
  const animationRef = useRef<number | null>(null);
  const { credits } = useCredits();
  const [showTooltip, setShowTooltip] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlayable, setIsPlayable] = useState(false);

  const stringToColor = (str: string) => {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= 16777619;
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += value.toString(16).padStart(2, "0");
    }
    return color;
  };

  useEffect(() => {
    const fetchSubscribedAccounts = async () => {
      if (!session?.user?.id) {
        setError("Please connect your X account to view your subscriptions.");
        setGraphData({ nodes: [], edges: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/get-subscribed-accounts?twitterId=${session.user.id}`
        );
        const data = await response.json();
        if (data.success) {
          setGraphData({ nodes: [], edges: [] });
          setLoading(false);
          setError(null);

          const subscribedAccounts: SubscribedAccount[] = data.data || [];

          const nodes: GraphNode[] = [
            {
              id: session.user.id,
              label: "You",
              group: 1,
              title: `Your Account 🌟\nTwitter ID: ${session.user.id}\nConnections: ${subscribedAccounts.length} accounts`,
              size: 35,
              shape: "circularImage",
              image: "/img/maxxit_icon.svg",
            },
          ];

          const edges: GraphEdge[] = [];

          subscribedAccounts.forEach(
            (account: SubscribedAccount, index: number) => {
              const today = new Date();
              const expiry = new Date(account.expiryDate);
              const daysUntilExpiry = Math.ceil(
                (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              const nodeColor = stringToColor(account.twitterHandle);
              const hasImage =
                account.userProfileUrl && account.userProfileUrl.trim() !== "";

              nodes.push({
                id: account.twitterHandle,
                label: account.twitterHandle,
                group: 2,
                title: `@${account.twitterHandle} 🐦\nSubscribed: ${new Date(
                  account.subscriptionDate
                ).toLocaleDateString()}\nExpires in: ${daysUntilExpiry} days\nClick to view profile`,
                size: 25 + Math.random() * 5,
                shape: hasImage ? "circularImage" : "circle",
                ...(hasImage && { image: account.userProfileUrl }),
              });

              edges.push({
                from: session.user.id,
                to: account.twitterHandle,
                width: 2 + Math.random() * 2,
                color: { color: nodeColor, highlight: "#ffffff", opacity: 0.8 },
                length: 200 + Math.random() * 10,
              });
            }
          );

          setGraphData({ nodes, edges });
        }
      } catch (err: any) {
        console.error("Error fetching subscribed accounts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedAccounts();
  }, [session?.user?.id, credits, isPlayable]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star class
    class Star {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
      }

      update(time: number) {
        this.opacity = 0.5 + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create stars
    const starCount = 400;
    const stars = Array.from({ length: starCount }, () => new Star());

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = (Date.now() - startTime) / 1000;
      stars.forEach((star) => {
        star.update(currentTime);
        star.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [credits, isPlayable]);

  const startSignalAnimation = (centralPos: any, surroundingNodeIds: string[], positions: any) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Apply initial glow effect to surrounding nodes
    surroundingNodeIds.forEach((nodeId) => {
      if (nodesDataSet.current) {
        nodesDataSet.current.update({
          id: nodeId,
          shadow: {
            enabled: true,
            color: stringToColor(nodeId),
            size: 70,
            x: 0,
            y: 0,
          },
        });
      }
    });

    // Get central node data
    const centralNodeData = nodesDataSet.current?.get(session?.user?.id);
    const centralRadius = centralNodeData?.size;

    // Create or update temporary nodes
    const tempNodeIds = surroundingNodeIds.map((nodeId, index) => {
      const tempNodeId = `temp-${index}`;
      const nodePos = positions[nodeId];
      const nodeData = nodesDataSet.current?.get(nodeId);
      const nodeRadius = nodeData?.size;

      // Calculate direction vector D
      const D_x = centralPos.x - nodePos.x;
      const D_y = centralPos.y - nodePos.y;
      const d = Math.sqrt(D_x * D_x + D_y * D_y);

      let startX, startY, endX, endY;
      if (d > 0) {
        startX = nodePos.x + (D_x / d) * nodeRadius;
        startY = nodePos.y + (D_y / d) * nodeRadius;
        endX = centralPos.x - (D_x / d) * centralRadius;
        endY = centralPos.y - (D_y / d) * centralRadius;
      } else {
        startX = nodePos.x;
        startY = nodePos.y;
        endX = centralPos.x;
        endY = centralPos.y;
      }

      if (nodesDataSet.current?.get(tempNodeId)) {
        nodesDataSet.current.update({
          id: tempNodeId,
          x: startX,
          y: startY,
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY,
          hidden: false,
        });
      } else {
        nodesDataSet.current?.add({
          id: tempNodeId,
          x: startX,
          y: startY,
          startX: startX,
          startY: startY,
          endX: endX,
          endY: endY,
          label: "",
          size: 5,
          color: stringToColor(nodeId),
          shape: "dot",
          fixed: { x: true, y: true },
          chosen: false,
          shadow: {
            enabled: true,
            color: stringToColor(nodeId),
            size: 20,
            x: 0,
            y: 0,
          },
        });
      }
      return tempNodeId;
    });

    const animationDuration = 2000;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      tempNodeIds.forEach((tempNodeId) => {
        const tempNode = nodesDataSet.current?.get(tempNodeId);
        if (tempNode) {
          const newX = tempNode.startX + (tempNode.endX - tempNode.startX) * progress;
          const newY = tempNode.startY + (tempNode.endY - tempNode.startY) * progress;
          nodesDataSet.current?.update({
            id: tempNodeId,
            x: newX,
            y: newY,
          });
        }
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        tempNodeIds.forEach((tempNodeId) => {
          nodesDataSet.current?.update({
            id: tempNodeId,
            hidden: true,
          });
        });

        setTimeout(() => {
          surroundingNodeIds.forEach((nodeId) => {
            if (nodesDataSet.current) {
              nodesDataSet.current.update({
                id: nodeId,
                shadow: {
                  enabled: true,
                  color: "rgba(0,0,0,0.5)",
                  size: 10,
                  x: 0,
                  y: 0,
                },
              });
            }
          });

          tempNodeIds.forEach((tempNodeId) => {
            const tempNode = nodesDataSet.current?.get(tempNodeId);
            if (tempNode) {
              nodesDataSet.current?.update({
                id: tempNodeId,
                x: tempNode.startX,
                y: tempNode.startY,
                hidden: false,
              });
            }
          });

          surroundingNodeIds.forEach((nodeId) => {
            if (nodesDataSet.current) {
              nodesDataSet.current.update({
                id: nodeId,
                shadow: {
                  enabled: true,
                  color: stringToColor(nodeId),
                  size: 70,
                  x: 0,
                  y: 0,
                },
              });
            }
          });

          startTime = Date.now();
          animationRef.current = requestAnimationFrame(animate);
        }, 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const startCentralPulse = (centralNodeId: string) => {
    let start = Date.now();
    const duration = 2000;

    const animatePulse = () => {
      const elapsed = Date.now() - start;
      const t = (Math.sin((elapsed / duration) * 2 * Math.PI) + 1) / 2;
      const shadowSize = 10 + t * 50;
      const borderWidth = 2 + t * 4;

      if (nodesDataSet.current) {
        nodesDataSet.current.update({
          id: centralNodeId,
          shadow: {
            enabled: true,
            color: "rgba(0,0,0,0.7)",
            size: shadowSize,
            x: 0,
            y: 0,
          },
          borderWidth,
        });
      }

      requestAnimationFrame(animatePulse);
    };

    requestAnimationFrame(animatePulse);
  };

  useEffect(() => {
    if (networkRef.current && graphData.nodes.length > 0) {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      nodesDataSet.current = new DataSet(graphData.nodes);
      edgesDataSet.current = new DataSet(graphData.edges as any);

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
            strokeWidth: 0,
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
          shapeProperties: { useBorderWithImage: true },
        },
        edges: {
          smooth: isPlayable
            ? {
              enabled: true,
              type: "continuous",
              forceDirection: "none",
              roundness: 0.5,
            }
            : false,
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
              background: "#333333",
              border: "#0f0f0f",
              highlight: { background: "#444444", border: "#0f0f0f" },
            },
            fontColor: "#ffffff",
            borderWidth: 3,
          },
          2: {
            color: {
              border: "#0f0f0f",
              highlight: { background: "#333333", border: "#0f0f0f" },
            },
            fontColor: "#ffffff",
            borderWidth: 2,
          },
        },
        physics: {
          stabilization: {
            enabled: true,
            iterations: 200,
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
          dragNodes: isPlayable ? true : false,
        },
        height: "680px",
        width: "100%",
      };

      networkInstance.current = new Network(networkRef.current, data, options);

      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);
          if (nodeId !== session?.user?.id && nodeId !== "current-user") {
            window.open(`https://twitter.com/${nodeId}`, "_blank");
          }
        } else {
          setSelectedNode(null);
        }
      });

      networkInstance.current.on("hoverNode", function (params) {
        networkRef.current?.style.setProperty("cursor", "pointer");
        setHoveredNode(params.node);
        setShowTooltip(true);
      });

      networkInstance.current.on("blurNode", function (params) {
        networkRef.current?.style.setProperty("cursor", "default");
        setHoveredNode(null);
        setShowTooltip(false);
      });

      networkInstance.current.on("zoom", function (params) {
        const newScale = networkInstance.current?.getScale() || 1;
        setZoomLevel(newScale);
      });

      networkInstance.current.once("stabilizationIterationsDone", function () {
        networkInstance.current?.fit({
          animation: { duration: 1000, easingFunction: "easeInOutQuad" },
        });

        networkInstance.current?.setOptions({ physics: isPlayable });

        const positions = networkInstance.current?.getPositions();
        const centralNodeId = session?.user?.id;
        const centralPos = positions?.[centralNodeId];

        if (!isPlayable && centralNodeId && centralPos) {
          const surroundingNodeIds = graphData.nodes
            .filter((node) => node.id !== centralNodeId)
            .map((node) => node.id);

          if (surroundingNodeIds.length > 0) {
            startSignalAnimation(centralPos, surroundingNodeIds, positions);
            startCentralPulse(centralNodeId);
          }
        } else {
          const surroundingNodeIds = graphData.nodes
            .filter((node) => node.id !== session?.user?.id)
            .map((node) => node.id);

          if (surroundingNodeIds.length > 0 && nodesDataSet.current) {
            // Optional: Add shadow interval logic if needed
          }
        }
      });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [graphData, session?.user?.id, isPlayable]);

  const handleZoomIn = () => {
    if (networkInstance.current) {
      const newScale = zoomLevel * 1.2;
      networkInstance.current.moveTo({ scale: newScale });
      setZoomLevel(newScale);
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const newScale = zoomLevel * 0.8;
      networkInstance.current.moveTo({ scale: newScale });
      setZoomLevel(newScale);
    }
  };

  const handleFitNetwork = () => {
    if (networkInstance.current) {
      networkInstance.current.fit({
        animation: { duration: 1000, easingFunction: "easeInOutQuad" },
      });
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none starfield">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      <div className="w-full max-w-7xl z-10 relative p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Your Network
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-sm text-gray-300 font-medium">
              Explore Mode
            </span>
            <button
              onClick={() => setIsPlayable(!isPlayable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPlayable ? "bg-blue-500" : "bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPlayable ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span className="text-sm text-gray-300 font-medium">Play Mode</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-transparent rounded-xl border border-gray-800/30 shadow-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-14 h-14 mb-4 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
                <Loader2 className="w-14 h-14 text-blue-500/70 animate-spin absolute inset-0" />
              </div>
              <h3 className="text-xl font-medium text-gray-200 mb-1">
                Loading Data
              </h3>
              <p className="text-gray-400 text-sm">
                Initializing your network...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center bg-gray-900 bg-opacity-30 p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
            <p className="text-gray-200 text-lg">{error}</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="w-full">
              <div className="relative w-full">
                <div
                  className="w-full rounded-xl overflow-hidden bg-[#323442]/10 backdrop-blur-lg border border-gray-800 shadow-2xl"
                  style={{
                    boxShadow:
                      "inset 0 0 25px rgba(55, 65, 81, 0.6), 0 0 20px rgba(55, 65, 81, 0.5)",
                  }}
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex gap-2 w-fit text-sm sm:text-base top-4 left-4 bg-[#323442]/10 backdrop-blur-md p-2 rounded-lg shadow-lg z-10 border border-gray-800">
                      <button
                        onClick={handleZoomIn}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800/70 hover:bg-gray-700 transition-colors"
                        title="Zoom In"
                      >
                        <span className="text-lg">+</span>
                      </button>
                      <button
                        onClick={handleZoomOut}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800/70 hover:bg-gray-700 transition-colors"
                        title="Zoom Out"
                      >
                        <span className="text-lg">-</span>
                      </button>
                      <button
                        onClick={handleFitNetwork}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800/70 hover:bg-gray-700 transition-colors"
                        title="Fit View"
                      >
                        <span className="text-sm">⤢</span>
                      </button>
                    </div>
                    <div className="bg-[#323442]/10 px-4 py-2 rounded-full shadow-lg border border-gray-800">
                      <p className="text-gray-300 font-semibold flex items-center text-sm sm:text-base">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {graphData.nodes.length > 1 ? (
                          <span>
                            {graphData.nodes.length - 1} Connected Accounts
                          </span>
                        ) : (
                          <span>No connections</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900 to-gray-900 p-4 rounded-lg shadow-lg text-sm transform transition-all duration-300 hover:scale-105">
                    <p className="font-semibold text-blue-200 mb-2">
                      Network Legend
                    </p>
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2 shadow-md"></div>
                      <span className="text-blue-100">You</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-400 mr-2 shadow-md"></div>
                      <span className="text-blue-100">Subscribed Account</span>
                    </div>
                  </div>

                  <div
                    ref={networkRef}
                    className="w-full h-[680px] overflow-hidden"
                  />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="bg-[#323442]/10 bg-opacity-70 px-4 py-2 rounded-lg text-gray-300 text-sm md:text-base shadow-md">
                      Drag to explore | Click nodes to visit profiles
                    </p>
                  </div>
                </div>
              </div>

              {selectedNode &&
                selectedNode !== session?.user?.id &&
                selectedNode !== "current-user" && (
                  <div className="mt-6 bg-[#323442]/10 p-5 rounded-xl border border-gray-800 shadow-xl animate-pop-up w-fit">
                    <p className="text-gray-300 text-lg">
                      Selected:{" "}
                      <span className="font-bold text-gray-200">
                        @{selectedNode}
                      </span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click to visit their Twitter profile
                    </p>
                  </div>
                )}
            </div>
          </div>
        )} 
      </div>

      <style jsx>{`
        .starfield {
          background: radial-gradient(
            ellipse at center,
            #2f3657 0%,
            #020617 50%
          );
          overflow: hidden;
        }

        .starfield::before,
        .starfield::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(
              2px 2px at 20px 50px,
              rgba(255, 255, 255, 0.8),
              transparent
            ),
            radial-gradient(
              1px 1px at 80px 120px,
              rgba(255, 255, 255, 0.6),
              transparent
            ),
            radial-gradient(
              1px 1px at 150px 80px,
              rgba(255, 255, 255, 0.7),
              transparent
            ),
            radial-gradient(
              2px 2px at 200px 200px,
              rgba(255, 255, 255, 0.5),
              transparent
            );
          background-size: 300px 300px;
          opacity: 0.6;
        }

        .starfield::after {
          background: 
            radial-gradient(
              1px 1px at 50px 100px,
              rgba(255, 255, 255, 0.9),
              transparent
            ),
            radial-gradient(
              2px 2px at 120px 60px,
              rgba(255, 255, 255, 0.7),
              transparent
            ),
            radial-gradient(
              1px 1px at 180px 150px,
              rgba(255, 255, 255, 0.6),
              transparent
            );
          background-size: 400px 400px;
          opacity: 0.4;
          animation: twinkle 10s infinite alternate;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.4;
          }
          100% {
            opacity: 0.6;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        @keyframes spin-reverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s infinite linear;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }
        @keyframes pop-up {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop-up {
          animation: pop-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}