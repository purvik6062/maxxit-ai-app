"use client";

import { useEffect, useState, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";
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
  const [showScrollHelper, setShowScrollHelper] = useState(false);

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
    console.time('FetchSubscribedAccounts');
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
        console.time('API Fetch');
        const response = await fetch(
          `/api/get-subscribed-accounts?twitterId=${session.user.id}`
        );
        const data = await response.json();
        console.timeEnd('API Fetch');
        if (data.success) {
          setGraphData({ nodes: [], edges: [] });
          setLoading(false);
          setError(null);

          const subscribedAccounts: SubscribedAccount[] = data.data || [];

          console.time('Build Nodes and Edges');
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
                from: session.user.id || '',
                to: account.twitterHandle,
                width: 2 + Math.random() * 2,
                color: { color: nodeColor, highlight: "#ffffff", opacity: 0.8 },
                length: 200 + Math.random() * 10,
              });
            }
          );
          console.timeEnd('Build Nodes and Edges');

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
    console.timeEnd('FetchSubscribedAccounts');
  }, [session?.user?.id, credits, isPlayable]);

  useEffect(() => {
    console.time('ScrollHandlerSetup');
    const handleScroll = () => {
      console.time('HandleScroll');
      if (!networkRef.current) return;
      const rect = networkRef.current.getBoundingClientRect();
      setShowScrollHelper(
        rect.top < window.innerHeight && rect.bottom > 0
      );
      console.timeEnd('HandleScroll');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    console.timeEnd('ScrollHandlerSetup');
    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  useEffect(() => {
    console.time('NetworkSetup');
    if (networkRef.current && graphData.nodes.length > 0) {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      console.time('CreateDataSets');
      nodesDataSet.current = new DataSet(graphData.nodes);
      edgesDataSet.current = new DataSet(graphData.edges as any);
      console.timeEnd('CreateDataSets');

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
          mouseWheel: {
            enabled: false,
          },
        },
        height: "680px",
        width: "100%",
      };

      console.time('NetworkInitialization');
      networkInstance.current = new Network(networkRef.current, data, options);
      console.timeEnd('NetworkInitialization');

      networkInstance.current.on("click", function (params) {
        console.time('ClickEvent');
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);
          if (nodeId !== session?.user?.id && nodeId !== "current-user") {
            window.open(`https://twitter.com/${nodeId}`, "_blank");
          }
        } else {
          setSelectedNode(null);
        }
        console.timeEnd('ClickEvent');
      });

      networkInstance.current.on("hoverNode", function (params) {
        console.time('HoverNodeEvent');
        networkRef.current?.style.setProperty("cursor", "pointer");
        setHoveredNode(params.node);
        setShowTooltip(true);
        console.timeEnd('HoverNodeEvent');
      });

      networkInstance.current.on("blurNode", function (params) {
        console.time('BlurNodeEvent');
        networkRef.current?.style.setProperty("cursor", "default");
        setHoveredNode(null);
        setShowTooltip(false);
        console.timeEnd('BlurNodeEvent');
      });

      networkInstance.current.on("zoom", function (params) {
        console.time('ZoomEvent');
        const newScale = networkInstance.current?.getScale() || 1;
        setZoomLevel(newScale);
        console.timeEnd('ZoomEvent');
      });

      networkInstance.current.once("stabilizationIterationsDone", function () {
        console.time('StabilizationDone');
        networkInstance.current?.fit({
          animation: { duration: 1000, easingFunction: "easeInOutQuad" },
        });

        networkInstance.current?.setOptions({ physics: isPlayable });

        const positions = networkInstance.current?.getPositions() || {};
        const centralNodeId = session?.user?.id;
        const centralPos = centralNodeId ? positions[centralNodeId] : undefined;

        if (!isPlayable && centralNodeId && centralPos) {
          const surroundingNodeIds = graphData.nodes
            .filter((node) => node.id !== centralNodeId)
            .map((node) => node.id);
        } else {
          const surroundingNodeIds = graphData.nodes
            .filter((node) => node.id !== session?.user?.id)
            .map((node) => node.id);

          if (surroundingNodeIds.length > 0 && nodesDataSet.current) {
            // Optional: Add shadow interval logic if needed
          }
        }
        console.timeEnd('StabilizationDone');
      });
    }

    console.timeEnd('NetworkSetup');

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
    console.time('HandleZoomIn');
    if (networkInstance.current) {
      const newScale = zoomLevel * 1.2;
      networkInstance.current.moveTo({ scale: newScale });
      setZoomLevel(newScale);
    }
    console.timeEnd('HandleZoomIn');
  };

  const handleZoomOut = () => {
    console.time('HandleZoomOut');
    if (networkInstance.current) {
      const newScale = zoomLevel * 0.8;
      networkInstance.current.moveTo({ scale: newScale });
      setZoomLevel(newScale);
    }
    console.timeEnd('HandleZoomOut');
  };

  const handleFitNetwork = () => {
    console.time('HandleFitNetwork');
    if (networkInstance.current) {
      networkInstance.current.fit({
        animation: { duration: 1000, easingFunction: "easeInOutQuad" },
      });
    }
    console.timeEnd('HandleFitNetwork');
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent items-center justify-center relative overflow-y-auto">
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
                  className="w-full rounded-xl overflow-visible bg-[#323442]/10 backdrop-blur-lg border border-gray-800 shadow-2xl"
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

                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900 to-gray-900 p-4 rounded-lg shadow-lg text-sm transform transition-all duration-300 hover:scale-105 z-20">
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
                    className="w-full h-[680px] touch-action-pan-y"
                    style={{ touchAction: 'pan-y' }}
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

      {showScrollHelper && (
        <>
          <div className="fixed bottom-28 right-[21px] z-50 animate-bounce">
            <button 
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }} 
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
              aria-label="Scroll to top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
          <div className="fixed bottom-20 right-[21px] z-50 animate-bounce">
            <button 
              onClick={() => {
                const graphBottom = networkRef.current?.getBoundingClientRect().bottom || 0;
                window.scrollTo({
                  top: window.scrollY + graphBottom + 20,
                  behavior: 'smooth'
                });
              }} 
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
              aria-label="Scroll down"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </>
      )}

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

        .touch-action-pan-y {
          touch-action: pan-y;
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