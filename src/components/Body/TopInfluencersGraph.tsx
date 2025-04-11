"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Define interfaces for data structures
interface Influencer {
  id: number;
  name: string;
  profit: number;
  trades: number;
  roi: number;
  followers: number;
}

interface InfluencerNode extends Influencer {
  radius: number;
  orbitRadius: number;
  angle: number;
  speed: number;
  x: number;
  y: number;
  color: string;
  fillGradient: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkle: number;
}

interface CentralNode {
  id: string;
  name: string;
  radius: number;
  x: number;
  y: number;
}

export default function InfluencerProfitUniverse() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerNode | null>(null);

  // Generate smooth gradient colors
  const generateGradientColor = (value: number, min: number, max: number): string => {
    const ratio = (value - min) / (max - min);
    const hue = 220 + ratio * 140; // Range from blue to cyan
    return `hsl(${hue}, 80%, 60%)`;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select<SVGSVGElement, unknown>(svgRef.current).selectAll("*").remove();

    // Influencer data
    const influencerData: Influencer[] = [
      { id: 1, name: "Alice", profit: 12345, trades: 120, roi: 15.2, followers: 3200 },
      { id: 2, name: "Bob", profit: 9540, trades: 98, roi: 12.8, followers: 2800 },
      { id: 3, name: "Charlie", profit: 8200, trades: 110, roi: 10.4, followers: 2400 },
      { id: 4, name: "Diana", profit: 7750, trades: 85, roi: 9.7, followers: 2100 },
      { id: 5, name: "Ethan", profit: 6300, trades: 72, roi: 8.1, followers: 1900 },
      { id: 6, name: "Fiona", profit: 5100, trades: 65, roi: 7.5, followers: 1600 },
    ];

    // Get min and max values for scaling
    const minProfit = Math.min(...influencerData.map((d) => d.profit));
    const maxProfit = Math.max(...influencerData.map((d) => d.profit));

    // Set dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select<SVGSVGElement, unknown>(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create tooltip
    const tooltip = d3
      .select<HTMLDivElement, unknown>(tooltipRef.current!)
      .style("opacity", 0)
      .attr("class", "absolute hidden p-3 bg-gray-900 text-white rounded-lg shadow-xl border border-blue-500 z-10 pointer-events-none");

    // Create a radial gradient for the background
    const defs = svg.append("defs");

    // Create radial gradient
    const radialGradient = defs
      .append("radialGradient")
      .attr("id", "universe-background")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    radialGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1c3d5a");

    radialGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f172a");

    // Add background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#universe-background)");

    // Add stars in the background
    const starsCount = 150;
    const stars: Star[] = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * 2000 + 1000, // Random twinkle timing
    }));

    const starsGroup = svg.append("g").attr("class", "stars");

    stars.forEach((star, i) => {
      const starElem = starsGroup
        .append("circle")
        .attr("cx", star.x)
        .attr("cy", star.y)
        .attr("r", star.radius)
        .attr("fill", "white")
        .attr("opacity", star.opacity);

      // Add twinkling effect
      function twinkle() {
        starElem
          .transition()
          .duration(star.twinkle)
          .attr("opacity", Math.random() * 0.5 + 0.2)
          .transition()
          .duration(star.twinkle)
          .attr("opacity", Math.random() * 0.8 + 0.2)
          .on("end", twinkle);
      }

      twinkle();
    });

    // Create central "sun" (platform)
    const centralNode: CentralNode = {
      id: "central",
      name: "Maxxit",
      radius: 40,
      x: width / 2,
      y: height / 2,
    };

    // Append center platform gradient
    const centerGradient = defs.append("radialGradient").attr("id", "center-gradient");

    centerGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffd700");

    centerGradient
      .append("stop")
      .attr("offset", "60%")
      .attr("stop-color", "#ff8c00");

    centerGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff4500");

    // Add center glow effect
    const centerGlow = svg
      .append("circle")
      .attr("cx", centralNode.x)
      .attr("cy", centralNode.y)
      .attr("r", centralNode.radius * 1.5)
      .attr("fill", "url(#center-gradient)")
      .attr("opacity", 0.3)
      .attr("filter", "blur(10px)");

    // Animate the glow
    function pulseGlow() {
      centerGlow
        .transition()
        .duration(2000)
        .attr("r", centralNode.radius * 2)
        .attr("opacity", 0.4)
        .transition()
        .duration(2000)
        .attr("r", centralNode.radius * 1.5)
        .attr("opacity", 0.3)
        .on("end", pulseGlow);
    }

    pulseGlow();

    // Add central platform
    svg
      .append("circle")
      .attr("cx", centralNode.x)
      .attr("cy", centralNode.y)
      .attr("r", centralNode.radius)
      .attr("fill", "url(#center-gradient)")
      .attr("stroke", "#ffd700")
      .attr("stroke-width", 2);

    // Add platform label
    svg
      .append("text")
      .attr("x", centralNode.x)
      .attr("y", centralNode.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text("Maxxit");

    // Create orbits for influencers
    const orbitRadii = d3
      .scaleLinear()
      .domain([0, influencerData.length - 1])
      .range([120, 250]);

    // Draw orbits
    influencerData.forEach((_, i) => {
      svg
        .append("circle")
        .attr("cx", centralNode.x)
        .attr("cy", centralNode.y)
        .attr("r", orbitRadii(i))
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.1)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    });

    // Create influencer nodes
    const influencerNodes: InfluencerNode[] = influencerData.map((influencer, i) => {
      // Calculate initial angle
      const angle = i * (2 * Math.PI / influencerData.length);
      const orbitRadius = orbitRadii(i);

      // Scale node size based on profit
      const sizeScale = d3
        .scaleLinear()
        .domain([minProfit, maxProfit])
        .range([25, 40]);

      return {
        ...influencer,
        radius: sizeScale(influencer.profit),
        orbitRadius,
        angle,
        speed: 0.0002 * (6 - i), // Higher ranked influencers move faster
        x: centralNode.x + orbitRadius * Math.cos(angle),
        y: centralNode.y + orbitRadius * Math.sin(angle),
        color: generateGradientColor(influencer.profit, minProfit, maxProfit),
        fillGradient: "", // Will be set later
      };
    });

    // Create node gradients
    influencerNodes.forEach((node) => {
      const gradientId = `gradient-${node.id}`;

      const nodeGradient = defs.append("radialGradient").attr("id", gradientId);

      // Customize gradient stops based on node's color
      nodeGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.rgb(node.color).brighter(1).toString());

      nodeGradient
        .append("stop")
        .attr("offset", "70%")
        .attr("stop-color", node.color);

      nodeGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.rgb(node.color).darker(1).toString());

      node.fillGradient = `url(#${gradientId})`;
    });

    // Draw connection lines
    const connectionLinesGroup = svg.append("g").attr("class", "connection-lines");

    const connectionLines = connectionLinesGroup
      .selectAll<SVGLineElement, InfluencerNode>(".connection-line")
      .data(influencerNodes)
      .enter()
      .append("line")
      .attr("class", "connection-line")
      .attr("x1", centralNode.x)
      .attr("y1", centralNode.y)
      .attr("x2", (d: { x: any; }) => d.x)
      .attr("y2", (d: { y: any; }) => d.y)
      .attr("stroke", (d: { color: any; }) => d.color)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "5,5");

    // Draw trail effects for nodes
    const trailsGroup = svg.append("g").attr("class", "trails");

    // Create node elements
    const nodesGroup = svg.append("g").attr("class", "nodes");

    const nodeElements = nodesGroup
      .selectAll<SVGGElement, InfluencerNode>(".node")
      .data(influencerNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: { x: any; y: any; }) => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer")
      .on("mouseover",  (event: MouseEvent, d: InfluencerNode) => {
        // Highlight node
        d3.select<SVGGElement, InfluencerNode>(this)
          .select("circle")
          .transition()
          .duration(300)
          .attr("r", d.radius * 1.1)
          .attr("stroke-width", 3);

        // Show tooltip
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("display", "block");

        tooltip.html(`
          <div class="font-bold text-lg mb-1">${d.name}</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>Profit:</div>
            <div class="font-medium">$${d.profit.toLocaleString()}</div>
            <div>Trades:</div>
            <div class="font-medium">${d.trades}</div>
            <div>ROI:</div>
            <div class="font-medium">${d.roi}%</div>
            <div>Followers:</div>
            <div class="font-medium">${d.followers.toLocaleString()}</div>
          </div>
        `);
        // Position tooltip
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function (event: MouseEvent, d: InfluencerNode) {
        // Restore node
        d3.select<SVGGElement, InfluencerNode>(this)
          .select("circle")
          .transition()
          .duration(300)
          .attr("r", d.radius)
          .attr("stroke-width", 2);

        // Hide tooltip
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0)
          .style("display", "none");
      })
      .on("click", function (event: MouseEvent, d: InfluencerNode) {
        setSelectedInfluencer(d);
      });

    // Add node circles
    nodeElements
      .append("circle")
      .attr("r", (d: { radius: any; }) => d.radius)
      .attr("fill", (d: { fillGradient: any; }) => d.fillGradient)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add node labels
    nodeElements
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d: { name: any; }) => d.name);

    // Add rank number
    nodeElements
      .append("text")
      .attr("class", "rank-label")
      .attr("x", (d: { radius: number; }) => -d.radius - 10)
      .attr("y", (d: { radius: number; }) => -d.radius - 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 2)
      .attr("paint-order", "stroke")
      .text((d: any, i: number) => `#${i + 1}`);

    // Animation function
    function animateNodes() {
      // Update positions based on orbit
      influencerNodes.forEach((node) => {
        node.angle += node.speed;
        node.x = centralNode.x + node.orbitRadius * Math.cos(node.angle);
        node.y = centralNode.y + node.orbitRadius * Math.sin(node.angle);

        // Create trailing effect
        trailsGroup
          .append("circle")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", 3)
          .attr("fill", node.color)
          .attr("opacity", 0.7)
          .transition()
          .duration(1500)
          .attr("r", 1)
          .attr("opacity", 0)
          .remove();
      });

      // Update node positions
      nodeElements.attr("transform", (d: { x: any; y: any; }) => `translate(${d.x},${d.y})`);

      // Update connection lines
      connectionLines
        .attr("x2", (d: { x: any; }) => d.x)
        .attr("y2", (d: { y: any; }) => d.y);

      // Continue animation
      requestAnimationFrame(animateNodes);
    }

    // Start animation
    animateNodes();

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "1.5em")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text("Top Influencer Universe");

    // Add subtitle
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.9em")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      // .text("Orbit speed and size indicate performance");
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
        Maxxit Top Influencers Universe
      </h1>
      <p className="text-gray-300 mb-8">Visualizing the crypto influencer ecosystem in real-time</p>

      <div className="w-full max-w-6xl relative rounded-xl overflow-hidden bg-gray-900 shadow-2xl border border-gray-800">
        <svg
          ref={svgRef}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 900 600"
        ></svg>
        <div ref={tooltipRef}></div>

        <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 p-3 rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-1">Universe Legend</p>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-300 to-orange-500 mr-2"></div>
            <span>Maxxit Platform</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 mr-2"></div>
            <span>Influencers (size by profit)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-[2px] bg-white opacity-20 mr-2"></div>
            <span>Orbit Paths</span>
          </div>
        </div>
      </div>

      {selectedInfluencer && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-blue-600 shadow-lg max-w-md">
          <h3 className="text-xl font-bold mb-2">{selectedInfluencer.name}&apos;s Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400 text-sm">Profit</div>
              <div className="text-lg font-medium">${selectedInfluencer.profit.toLocaleString()}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400 text-sm">ROI</div>
              <div className="text-lg font-medium">{selectedInfluencer.roi}%</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400 text-sm">Trades</div>
              <div className="text-lg font-medium">{selectedInfluencer.trades}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-gray-400 text-sm">Followers</div>
              <div className="text-lg font-medium">{selectedInfluencer.followers.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}