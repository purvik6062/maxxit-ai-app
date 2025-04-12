"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type Influencer = {
  id: string;
  name: string;
  profit: number;
  followers: number;
  accuracy: number;
  recentPredictions: number;
  avatar: string;
  specialties: string[];
};

type PlatformNode = {
  id: string;
  name: string;
  radius: number;
  avatar: string;
  fx: number;
  fy: number;
  group?: number;
};

type InfluencerNode = {
  id: string;
  name: string;
  radius: number;
  avatar: string;
  data: Influencer;
  group: number;
  fx?: number;
  fy?: number;
};

type GraphNode = PlatformNode | InfluencerNode;

type GraphLink = {
  source: string;
  target: string;
  value: number;
  specialty?: string;
};

export default function CosmicWebInfluencerGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // New state for zoom level

  // Sample data - replace with your actual data
  const influencerData: Influencer[] = [
    {
      id: "inf1",
      name: "CryptoMaster",
      profit: 18320,
      followers: 245000,
      accuracy: 92,
      recentPredictions: 24,
      avatar: "https://picsum.photos/id/300/200",
      specialties: ["Bitcoin", "Ethereum", "Altcoins"],
    },
    {
      id: "inf2",
      name: "TokenWhisperer",
      profit: 15100,
      followers: 198000,
      accuracy: 89,
      recentPredictions: 31,
      avatar: "https://picsum.photos/id/600/200",
      specialties: ["DeFi", "NFTs", "Solana"],
    },
    {
      id: "inf3",
      name: "BlockchainOracle",
      profit: 12750,
      followers: 173000,
      accuracy: 87,
      recentPredictions: 19,
      avatar: "https://picsum.photos/id/400/200",
      specialties: ["Technical Analysis", "Long-term Holds", "Market Cycles"],
    },
    {
      id: "inf4",
      name: "CoinVoyager",
      profit: 10820,
      followers: 156000,
      accuracy: 84,
      recentPredictions: 27,
      avatar: "https://picsum.photos/id/300/300",
      specialties: ["Emerging Markets", "Layer 2", "Gaming Tokens"],
    },
    {
      id: "inf5",
      name: "SatoshiDisciple",
      profit: 9650,
      followers: 132000,
      accuracy: 83,
      recentPredictions: 22,
      avatar: "https://picsum.photos/id/300/400",
      specialties: ["Bitcoin", "Mining", "On-chain Analysis"],
    },
    {
      id: "inf6",
      name: "AltcoinArchitect",
      profit: 8340,
      followers: 118000,
      accuracy: 81,
      recentPredictions: 29,
      avatar: "https://picsum.photos/id/500/300",
      specialties: ["Altcoins", "ICOs", "New Listings"],
    },
  ];

  // Define nodes for cosmic web layout
  const createNodesAndLinks = () => {
    // Create center platform node
    const nodes: GraphNode[] = [
      {
        id: "platform",
        name: "Maxxit",
        radius: 60,
        avatar: "/img/maxxit_icon.svg",
        fx: dimensions.width / 2,
        fy: dimensions.height / 2,
      },
    ];

    // Create influencer nodes
    influencerData.forEach((inf, i) => {
      // Calculate profit scale - larger profit = larger node
      const profitScale = d3
        .scaleLinear()
        .domain([8000, 20000])
        .range([35, 50]);

      nodes.push({
        id: inf.id,
        name: inf.name,
        data: inf,
        radius: profitScale(inf.profit),
        avatar: inf.avatar || `https://picsum.photos/id/${(i + 10) * 5}/200`,
        group: i + 1,
      });
    });

    // Create links - connect platform to each influencer
    const links: GraphLink[] = influencerData.map((inf) => ({
      source: "platform",
      target: inf.id,
      value: inf.profit / 1000, // Link strength based on profit
    }));

    // Add links between influencers based on shared specialties
    for (let i = 0; i < influencerData.length; i++) {
      for (let j = i + 1; j < influencerData.length; j++) {
        const inf1 = influencerData[i];
        const inf2 = influencerData[j];

        // Find common specialties
        const commonSpecialties = inf1.specialties.filter((spec) =>
          inf2.specialties.includes(spec)
        );

        if (commonSpecialties.length > 0) {
          links.push({
            source: inf1.id,
            target: inf2.id,
            value: commonSpecialties.length * 1.5,
            // specialty: commonSpecialties[0]
          });
        }
      }
    }

    return { nodes, links };
  };

  // Initialize the visualization
  useEffect(() => {
    // Set container dimensions
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  // Create and render visualization when dimensions are available
  useEffect(() => {
    if (dimensions.width === 0 || !svgRef.current || !tooltipRef.current)
      return;

    setIsLoading(true);

    // Clear previous svg content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
      .style("background", "transparent");

    // Create defs for patterns (avatars)
    const defs = svg.append("defs");

    // Create cosmic background
    const cosmicGradient = defs
      .append("radialGradient")
      .attr("id", "cosmicGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    cosmicGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(30, 64, 175, 0.6)");

    cosmicGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(15, 23, 42, 0.1)");

    // Background glow
    svg
      .append("circle")
      .attr("cx", dimensions.width / 2)
      .attr("cy", dimensions.height / 2)
      .attr("r", Math.min(dimensions.width, dimensions.height) * 0.45)
      .attr("fill", "url(#cosmicGradient)")
      .attr("filter", "blur(30px)");

    // Generate data
    const { nodes, links } = createNodesAndLinks();

    // Create tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(15, 23, 42, 0.95)")
      .style("color", "white")
      .style("border", "1px solid rgba(71, 85, 105, 0.5)")
      .style("border-radius", "8px")
      .style("padding", "12px")
      .style("box-shadow", "0 10px 25px rgba(0, 0, 0, 0.5)")
      .style("z-index", "10");

    // Inside useEffect, after svg setup but before simulation
    // Add zoom buttons
    const zoomInButton = document.createElement("button");
    zoomInButton.textContent = "+";
    zoomInButton.className =
      "zoom-button bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md absolute top-4 right-16 z-20 transition-colors mr-2"; // Adjusted positioning and added margin
    containerRef.current.appendChild(zoomInButton);
    const zoomOutButton = document.createElement("button");
    zoomOutButton.textContent = "-";
    zoomOutButton.className =
      "zoom-button bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md absolute top-4 right-4 z-20 transition-colors"; // Adjusted positioning
    containerRef.current.appendChild(zoomOutButton);

    // Define zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2]) // Min 50%, max 200%
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Button event listeners
    zoomInButton.addEventListener("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.2);
    });

    zoomOutButton.addEventListener("click", () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.8);
    });

    // Setup force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
      )
      .force(
        "collide",
        d3.forceCollide().radius((d: any) => (d.radius || 40) + 10)
      );

    // Create pattern for each node's avatar
    nodes.forEach((node: any) => {
      defs
        .append("pattern")
        .attr("id", `avatar-${node.id}`)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr(
          "href",
          node.avatar || `https://picsum.photos/seed/${node.id}/200`
        )
        .attr("width", node.radius * 2 || 80)
        .attr("height", node.radius * 2 || 80)
        .attr("x", 0)
        .attr("y", 0);
    });

    // Create cosmos-themed link aesthetics
    const linkGradients = defs
      .selectAll(".link-gradient")
      .data(links)
      .enter()
      .append("linearGradient")
      .attr("id", (d, i) => `link-gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse");

    linkGradients
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", (d, i) => {
        return d.source === "platform" ? "#3b82f6" : "#06b6d4";
      });

    linkGradients
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d, i) => {
        return d.target === "platform" ? "#3b82f6" : "#22d3ee";
      });

    // Create web-like links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d, i) => `url(#link-gradient-${i})`)
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", (d: any) => d.value * 0.8)
      .style("filter", "drop-shadow(0 0 2px rgba(6, 182, 212, 0.5))");

    // Create node halos
    const nodeHalos = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => (d.radius || 40) + 10)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af";
        return ["#0891b2", "#06b6d4", "#22d3ee", "#3b82f6", "#60a5fa", "#0ea5e9"][d.group % 6];
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)
      .attr("filter", "blur(6px)");

    // Create outer glow halos
    const nodeOuterHalos = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => (d.radius || 40) + 15)
      .attr("fill", "transparent")
      .attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af";
        return ["#0891b2", "#06b6d4", "#22d3ee", "#3b82f6", "#60a5fa", "#0ea5e9"][d.group % 6];
      })
      .attr("stroke-width", 1)
      .attr("opacity", 0.3)
      .attr("filter", "blur(12px)");

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d: any) => d.radius || 40)
      .attr("fill", (d: any) => `url(#avatar-${d.id})`)
      .attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af";
        return ["#0891b2", "#06b6d4", "#22d3ee", "#3b82f6", "#60a5fa", "#0ea5e9"][d.group % 6];
      })
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d: any) {
        // Highlight on hover
        d3.select(this)
          .attr("stroke-width", 5)
          .attr("filter", "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))");

        // Show tooltip
        if (d.id !== "platform") {
          const inf = d.data;
          tooltip.html(`
            <div class="font-bold text-lg mb-1">${d.name}</div>
            <div class="text-emerald-400 font-medium">$${inf.profit.toLocaleString()} Profit Generated</div>
            <div class="text-blue-300">${inf.followers.toLocaleString()} Followers</div>
            <div class="text-amber-300">${inf.accuracy}% Accuracy</div>
            <div class="text-cyan-300">${
              inf.recentPredictions
            } Recent Predictions</div>
            <div class="mt-2 text-xs text-gray-300">Specialties: ${inf.specialties.join(
              ", "
            )}</div>
          `);
        } else {
          tooltip.html(`
            <div class="font-bold text-lg mb-1">Maxxit Platform</div>
            <div class="text-blue-300">Top 6 Daily Influencers</div>
            <div class="text-gray-300 text-sm mt-1">Click on influencers to view details</div>
          `);
        }

        // New tooltip positioning logic to keep it within container
        let tooltipX = d.x + (d.radius || 40) + 15; // Position to the right of the node
        let tooltipY = d.y - 20; // Slightly above the node center
        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        // Adjust if tooltip exceeds right boundary
        if (tooltipX + tooltipRect.width > containerRect.width) {
          tooltipX = d.x - tooltipRect.width - 15; // Move to the left of the node
        }
        // Adjust if tooltip exceeds bottom boundary
        if (tooltipY + tooltipRect.height > containerRect.height) {
          tooltipY = d.y - tooltipRect.height - 20;
        }
        // Ensure tooltip doesn't go off the top or left
        tooltipX = Math.max(0, tooltipX);
        tooltipY = Math.max(0, tooltipY);

        tooltip
          .style("visibility", "visible")
          .style("left", `${tooltipX}px`)
          .style("top", `${tooltipY}px`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-width", 3).attr("filter", null);

        tooltip.style("visibility", "hidden");
      })
      .on("click", (event, d: any) => {
        if (d.id !== "platform" && d.data) {
          setSelectedInfluencer(d.data);
        } else {
          setSelectedInfluencer(null);
        }
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add influencer name labels
    const nameLabels = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("font-weight", "bold")
      .attr("font-size", (d: any) => (d.id === "platform" ? "16px" : "14px"))
      .attr("fill", "white")
      .attr("filter", "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8))")
      .text((d: any) => d.name)
      .attr("dy", (d: any) => (d.radius || 40) + 20);

    // Add profit labels (only for influencers)
    const profitLabels = svg
      .append("g")
      .selectAll("text")
      .data(nodes.filter((d: any) => d.id !== "platform"))
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("font-size", "12px")
      .attr("fill", "#4ade80")
      .attr("filter", "drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8))")
      .text((d: any) => `$${d.data.profit.toLocaleString()}`)
      .attr("dy", (d: any) => (d.radius || 40) + 36);

    // Create cosmic particles around the visualization
    const particleCount = 60;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        radius: Math.random() * 3 + 1,
        color: d3.interpolateInferno(Math.random()),
        speed: Math.random() * 0.5 + 0.2,
      });
    }

    const particlesGroup = svg.append("g").attr("class", "particles");

    particles.forEach((particle) => {
      particlesGroup
        .append("circle")
        .attr("cx", particle.x)
        .attr("cy", particle.y)
        .attr("r", particle.radius)
        .attr("fill", particle.color)
        .attr("opacity", Math.random() * 0.5 + 0.3)
        .attr("filter", "blur(1px)");
    });

    // Add pulsing effect to the central node
    function pulseAnimation() {
      const centralHalo = svg
        .append("circle")
        .attr("cx", dimensions.width / 2)
        .attr("cy", dimensions.height / 2)
        .attr("r", 60)
        .attr("fill", "transparent")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);

      centralHalo
        .transition()
        .duration(2000)
        .attr("r", 120)
        .attr("opacity", 0)
        .on("end", function () {
          d3.select(this).remove();
          if (svgRef.current) pulseAnimation();
        });
    }

    // Start pulse animation
    pulseAnimation();

    // Signal stream animations
    function createSignalStream() {
      // Find a random influencer node
      const randomIndex = Math.floor(Math.random() * influencerData.length);
      const targetId = influencerData[randomIndex].id;
      const targetNode = nodes.find((n: any) => n.id === targetId);
      const centralNode = nodes.find((n: any) => n.id === "platform");

      if (!targetNode || !centralNode) return;

      // Create signal particle
      const signal = svg
        .append("circle")
        .attr("r", 4)
        .attr("fill", "#4ade80")
        .attr("cx", (centralNode as any).x)
        .attr("cy", (centralNode as any).y)
        .attr("opacity", 0.9)
        .attr("filter", "drop-shadow(0 0 2px rgb(74, 222, 128))");

      // Animate signal moving from central node to influencer
      signal
        .transition()
        .duration(1200)
        .attr("cx", (targetNode as any).x)
        .attr("cy", (targetNode as any).y)
        .on("end", function () {
          // Flash target node
          const targetNodeElem = node.filter((d: any) => d.id === targetId);

          targetNodeElem
            .transition()
            .duration(300)
            .attr("filter", "drop-shadow(0 0 12px rgba(74, 222, 128, 0.8))")
            .transition()
            .duration(300)
            .attr("filter", null);

          // Remove signal
          d3.select(this).remove();
        });
    }

    // Start signal stream animations at intervals
    const signalInterval = setInterval(() => {
      if (svgRef.current) createSignalStream();
    }, 3000);

    // Update node and link positions on each simulation tick
    simulation.on("tick", () => {
      // Update link positions
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Update link gradients
      linkGradients
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Update node positions
      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      // Update halo positions
      nodeHalos.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      // Update nodeHalos
      nodeHalos.attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af"; // Dark blue
        return ["#0891b2", "#06b6d4", "#22d3ee"][d.group % 3]; // Cyan and blue shades
      });

      // Update nodeOuterHalos
      nodeOuterHalos.attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af"; // Dark blue
        return ["#0891b2", "#06b6d4", "#22d3ee"][d.group % 3]; // Cyan and blue shades
      });

      // Update node
      node.attr("stroke", (d: any) => {
        if (d.id === "platform") return "#1e40af"; // Dark blue
        return ["#0891b2", "#06b6d4", "#22d3ee"][d.group % 3]; // Cyan and blue shades
      });

      nodeOuterHalos.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      // Update label positions
      nameLabels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      profitLabels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.id !== "platform") {
        // Keep platform node fixed
        d.fx = null;
        d.fy = null;
      }
    }

    // Set the central node to be fixed at the center
    nodes.find((n: any) => n.id === "platform")!.fx = dimensions.width / 2;
    nodes.find((n: any) => n.id === "platform")!.fy = dimensions.height / 2;

    // Stop loading after setup
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      simulation.stop();
      clearInterval(signalInterval);
    };
  }, [dimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500">
        Crypto Influencer Constellation
      </h1>
      <p className="text-gray-300 mb-8 text-center max-w-2xl">
        Visualizing our top 6 influencers by profit generated for our users
        through their crypto predictions
      </p>

      <div
        ref={containerRef}
        className="w-full max-w-6xl h-[600px] relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 shadow-2xl overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-b-cyan-500 border-gray-800 rounded-full animate-spin"></div>
          </div>
        )}

        <svg ref={svgRef} className="w-full h-full"></svg>
        <div ref={tooltipRef}></div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg border border-gray-700 shadow-lg text-sm z-10">
          <h3 className="font-bold mb-2 text-white">Constellation Legend</h3>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full bg-indigo-600 mr-2"></div>
            <span>Maxxit Platform</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-500 mr-2"></div>
            <span>Top Influencers</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 mr-2 rounded-full"></div>
            <span>Connection Strength</span>
          </div>
        </div>
      </div>

      {/* Selected influencer details card */}
      {selectedInfluencer && (
        <div className="mt-6 w-full max-w-lg bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
              <img
                src={
                  selectedInfluencer.avatar ||
                  `https://picsum.photos/seed/${selectedInfluencer.id}/200`
                }
                alt={selectedInfluencer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedInfluencer.name}</h3>
              <p className="text-emerald-400 font-semibold">
                ${selectedInfluencer.profit.toLocaleString()} Total Profit
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-blue-300 font-medium">
                {selectedInfluencer.followers.toLocaleString()} Followers
              </div>
              <div className="text-amber-300">
                {selectedInfluencer.accuracy}% Accuracy
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Recent Predictions</div>
              <div className="text-xl font-bold">
                {selectedInfluencer.recentPredictions}
              </div>
            </div>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Specialties</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedInfluencer.specialties.map((specialty, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-600 px-2 py-1 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedInfluencer(null)}
            className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}
