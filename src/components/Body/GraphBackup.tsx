"use client";

import { useEffect, useState, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";
import { Tooltip } from "react-tooltip";
import { useAccount } from "wagmi";
import { useCredits } from "@/context/CreditsContext";
import { hover } from "framer-motion";
import { useSession } from "next-auth/react";

type SubscribedAccount = {
  twitterHandle: string;
  subscriptionDate: string;
  expiryDate: string;
  userProfileUrl: string; // URL to the Twitter profile image
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
  const { address } = useAccount();
  const { data: session } = useSession();
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const nodesDataSet = useRef<DataSet<any> | null>(null);
  const edgesDataSet = useRef<DataSet<any> | null>(null);
  const { credits } = useCredits();

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

  // Fetch subscribed accounts and prepare graph data
  useEffect(() => {
    const fetchSubscribedAccounts = async () => {
      if (!session || !session.user?.id) return;
      try {
        const response = await fetch(
          `/api/get-subscribed-accounts?twitterId=${session.user.id}`
        );
        const data = await response.json();
        if (data.success) {
          setGraphData({ nodes: [], edges: [] }); // Clear previous data
          setLoading(false);
          setError(null);

          const subscribedAccounts: SubscribedAccount[] = data.data || [];

          const nodes: GraphNode[] = [
            {
              id: address || "current-user",
              label: "You",
              group: 1,
              title: `Your Account 🌟\nWallet: ${address}\nConnections: ${subscribedAccounts.length} accounts`,
              size: 35,
              shape: "circularImage",
              image: "/img/maxxit_icon.svg", // Default image for the user
            },
          ];

          const edges: GraphEdge[] = [];

          subscribedAccounts.forEach(
            (account: SubscribedAccount, index: number) => {
              // Calculate days until expiry
              const today = new Date();
              const expiry = new Date(account.expiryDate);
              const daysUntilExpiry = Math.ceil(
                (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              const nodeColor = stringToColor(account.twitterHandle);

              // Check if we have a valid image URL
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
                shape: hasImage ? "circularImage" : "circle", // Use circularImage only if we have an image
                ...(hasImage && { image: account.userProfileUrl }), // Only add image property if we have an image
              });

              edges.push({
                from: address || "current-user",
                to: account.twitterHandle,
                width: 2 + Math.random() * 2,
                color: {
                  // color: "#00ff00",
                  color: nodeColor,
                  highlight: "#ffffff",
                  opacity: 0.8,
                },
                length: 200 + Math.random() * 10,
              });
            }
          );

          setGraphData({ nodes, edges });
        }
      } catch (error) {
        console.error("Error fetching subscribed accounts:", error);
        setError("Failed to fetch subscribed accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedAccounts();
  }, [session]);

  // Initialize the Vis.js network graph
  useEffect(() => {
    if (networkRef.current && graphData.nodes.length > 0) {
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
          shapeProperties: {
            useBorderWithImage: true,
          },
        },
        edges: {
          smooth: {
            enabled: true,
            type: "continuous",
            forceDirection: "none",
            roundness: 0.5,
          },
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
          // Disable zoom to fix size issue
          zoomView: false,
          dragView: false,
        },
        // Fixed height and width to prevent scaling issues
        height: "580px",
        width: "100%",
      };

      networkInstance.current = new Network(networkRef.current, data, options);

      // Event listeners
      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);

          // If node is a Twitter handle, redirect to Twitter profile
          if (nodeId !== address && nodeId !== "current-user") {
            window.open(`https://twitter.com/${nodeId}`, "_blank");
          }
        } else {
          setSelectedNode(null);
        }
      });

      // Original click event handler
      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          setSelectedNode(nodeId);

          // If node is a Twitter handle, redirect to Twitter profile
          if (nodeId !== address && nodeId !== "current-user") {
            window.open(`https://twitter.com/${nodeId}`, "_blank");
          }
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

      // Add starting animation
      networkInstance.current.once("stabilizationIterationsDone", function () {
        // Zoom to fit after stabilization
        networkInstance.current?.fit({
          animation: {
            duration: 1000,
            easingFunction: "easeInOutQuad",
          },
        });
      });
    }

    // Cleanup on unmount
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [graphData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
        Your Signal Network
      </h1>
      <p className="text-gray-300 mb-8">
        Visualizing your subscribed accounts and connections
      </p>

      {loading ? (
        <div className="flex flex-col items-center text-center text-white">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading your network...</p>
        </div>
      ) : error ? (
        <div className="text-center bg-red-500 bg-opacity-20 p-6 rounded-lg border border-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-6xl relative">
            <div
              ref={networkRef}
              className="w-full h-[600px] border border-gray-700 rounded-xl overflow-hidden bg-gray-800 bg-opacity-50 shadow-2xl"
            />
            <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 p-3 rounded-lg shadow-lg text-sm">
              <p className="font-medium mb-1">Network Legend</p>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                <span>You</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <span>Subscribed Account</span>
              </div>
            </div>
          </div>

          {graphData.nodes.length > 1 ? (
            <p className="mt-4 text-gray-300">
              You are connected to {graphData.nodes.length - 1} accounts
            </p>
          ) : (
            <p className="mt-4 text-gray-300">No subscriptions found</p>
          )}

          {selectedNode &&
            selectedNode !== address &&
            selectedNode !== "current-user" && (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p>
                  Selected:{" "}
                  <span className="font-bold text-blue-400">
                    @{selectedNode}
                  </span>
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
