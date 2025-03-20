"use client";

import { useEffect, useState, useRef } from "react";
import { Network, DataSet } from "vis-network/standalone";
import { Tooltip } from 'react-tooltip';
import { useAccount } from "wagmi";
import { hover } from "framer-motion";

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
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const nodesDataSet = useRef<DataSet<any> | null>(null);
  const edgesDataSet = useRef<DataSet<any> | null>(null);

  // Generate a hash color from string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Fetch subscribed accounts and prepare graph data
  useEffect(() => {
    const fetchSubscribedAccounts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/get-subscribed-accounts?walletAddress=${address}`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error?.message || "Failed to fetch subscribed accounts"
          );
        }

        const subscribedAccounts: SubscribedAccount[] = data.data || [];

        const nodes: GraphNode[] = [
          {
            id: address || "current-user",
            label: "You",
            group: 1,
            title: `<div style="background-color: #1c2e4a; padding: 8px 12px; font-weight: bold; font-size: 14px; color: #fff; border-bottom: 1px solid #2a3f5f;">Your Account</div>
        <div style="padding: 12px; color: #e6e6e6; font-size: 13px;">
          <p>${address}</p>
          <p>Connected to ${subscribedAccounts.length} accounts</p>
        </div>`,
            size: 30,
            shape: "circle",
            image: "/img/new_logo.svg", // Default image for the user
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
              account.userProfileUrl &&
              account.userProfileUrl.trim() !== "";

            nodes.push({
              id: account.twitterHandle,
              label: account.twitterHandle,
              group: 2,
              title: `<div style="background-color: #1c2e4a; padding: 8px 12px; font-weight: bold; font-size: 14px; color: #fff; border-bottom: 1px solid #2a3f5f;">@${
                account.twitterHandle
              }</div>
        <div style="padding: 12px; color: #e6e6e6; font-size: 13px;">
          <p>Subscribed since: ${new Date(
            account.subscriptionDate
          ).toLocaleDateString()}</p>
          <p>Expires in: ${daysUntilExpiry} days</p>
          <p>Click to view profile</p>
          <p>Name: ${account.twitterHandle}</p>
        </div>`,
              size: 20 + Math.random() * 10,
              shape: hasImage ? "circularImage" : "circle", // Use circularImage only if we have an image
              ...(hasImage && { image: account.userProfileUrl }), // Only add image property if we have an image
            });

            edges.push({
              from: address || "current-user",
              to: account.twitterHandle,
              width: 2 + Math.random() * 2,
              color: {
                color: "#00ff00",
                // color: nodeColor,
                highlight: "#ffffff",
                opacity: 0.8,
              },
              length: 200 + Math.random() * 100,
            });
          }
        );

        setGraphData({ nodes, edges });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchSubscribedAccounts();
    }
  }, [address]);

  // Initialize the Vis.js network graph
  useEffect(() => {
    if (networkRef.current && graphData.nodes.length > 0) {
      // Create datasets to enable dynamic updates
    nodesDataSet.current = new DataSet(graphData.nodes.map(node => ({
      ...node,
      title: node.id // Just store the ID in the title for reference
    })));
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

      networkInstance.current.on("hoverNode", function (params) {
        networkRef.current?.style.setProperty("cursor", "pointer");
        const nodeId = params.node;
        const node = nodesDataSet.current?.get(nodeId);
        
        // Hide any existing tooltip
        const existingTooltip = document.getElementById('custom-network-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
        
        // Create a new tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'custom-network-tooltip';
        tooltip.className = 'custom-tooltip';
        
        // Position calculation
        const position = networkInstance.current?.canvasToDOM(params.pointer.canvas);
        
        // Fill content based on node type
        if (nodeId === address || nodeId === "current-user") {
          // Your account tooltip
          tooltip.innerHTML = `
            <div class="tooltip-header">Your Account</div>
            <div class="tooltip-content">
              <p>${address}</p>
              <p>Connected to ${graphData.nodes.length - 1} accounts</p>
            </div>
          `;
        } else {
          // Find the corresponding account data
          const accountNode = graphData.nodes.find(n => n.id === nodeId);
          
          // Twitter account tooltip
          tooltip.innerHTML = `
            <div class="tooltip-header">@${nodeId}</div>
            <div class="tooltip-content">
              <p><span class="tooltip-label">Subscribed since:</span> ${new Date(accountNode?.title?.match(/Subscribed since: (.*?)</)?.[1] || new Date()).toLocaleDateString()}</p>
              <p><span class="tooltip-label">Expires in:</span> ${accountNode?.title?.match(/Expires in: (.*?) days/)?.[1] || '0'} days</p>
              <p><span class="tooltip-label">Click to view profile</span></p>
            </div>
          `;
        }
        
        // Set tooltip position (offset to not cover the node)
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${position!.x + 10}px`;
        tooltip.style.top = `${position!.y + 10}px`;
        tooltip.style.zIndex = '1000';
        
        // Add to DOM
        document.body.appendChild(tooltip);
      });
  
      // Remove tooltip on blur
      networkInstance.current.on("blurNode", function () {
        networkRef.current?.style.setProperty("cursor", "default");
        const tooltip = document.getElementById('custom-network-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      });
  
      // Also remove tooltip on drag start
      networkInstance.current.on("dragStart", function () {
        const tooltip = document.getElementById('custom-network-tooltip');
        if (tooltip) {
          tooltip.remove();
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
        
        // Remove any tooltip when clicking
        const tooltip = document.getElementById('custom-network-tooltip');
        if (tooltip) {
          tooltip.remove();
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

    // // Cleanup on unmount
    // return () => {
    //   if (networkInstance.current) {
    //     networkInstance.current.destroy();
    //     networkInstance.current = null;
    //   }
    // };

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
      // Clean up any tooltips
      const tooltip = document.getElementById('custom-network-tooltip');
      if (tooltip) {
        tooltip.remove();
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
          <p className="text-2xl font-bold mb-2">Error</p>
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
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
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

      {/* <style jsx>{`
        .custom-tooltip {
          background-color: rgba(18, 24, 38, 0.95);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          font-family: "Inter", sans-serif;
          width: 250px;
        }
        .tooltip-header {
          background-color: #1c2e4a;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 14px;
          color: #fff;
          border-bottom: 1px solid #2a3f5f;
        }
        .tooltip-content {
          padding: 12px;
          color: #e6e6e6;
          font-size: 13px;
        }
        .tooltip-content p {
          margin: 6px 0;
          line-height: 1.4;
        }
      `}</style> */}

<style jsx global>{`
  .custom-tooltip {
    background-color: rgba(30, 41, 59, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    font-family: "Inter", sans-serif;
    width: 250px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    animation: fadeIn 0.2s ease-out;
    backdrop-filter: blur(8px);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .tooltip-header {
    background: linear-gradient(90deg, #1e40af 0%, #1e3a8a 100%);
    padding: 10px 14px;
    font-weight: bold;
    font-size: 14px;
    color: #fff;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  }
  
  .tooltip-content {
    padding: 12px 14px;
    color: #e2e8f0;
    font-size: 13px;
  }
  
  .tooltip-content p {
    margin: 8px 0;
    line-height: 1.5;
    display: flex;
    align-items: center;
  }
  
  .tooltip-label {
    color: #94a3b8;
    margin-right: 4px;
  }
  
  .custom-tooltip::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(30, 41, 59, 0.95);
  }
`}</style>
    </div>
  );
}
