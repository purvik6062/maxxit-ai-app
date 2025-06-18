import { AIAgent } from "./types";

export const AI_AGENTS: AIAgent[] = [
  {
    id: "trailing-stop",
    name: "Trailing Stop Agent",
    strategy: "trailing",
    description:
      "Automatically exits positions when price drops 1% from peak (for long positions) or rises 1% from lowest (for short positions). Perfect for capturing profits while limiting downside risk.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.00001,
    parameters: {
      trailPercent: 0.01,
    },
    features: [
      "Dynamic stop-loss adjustment",
      "Profit protection",
      "Minimizes emotional trading",
      "Works in all market conditions",
    ],
    riskLevel: "Medium",
    avgReturns: "12-18% APY",
    icon: "📈",
    available: true,
  },
  {
    id: "sma-10",
    name: "SMA 10 Agent",
    strategy: "sma",
    description:
      "Uses Simple Moving Average with a 10-period window to identify short-term trends. Generates buy/sell signals when price crosses above or below the moving average.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.08,
    parameters: {
      period: 10,
    },
    features: [
      "Short-term trend following",
      "Quick signal generation",
      "Low latency execution",
      "High frequency trading",
    ],
    riskLevel: "High",
    avgReturns: "15-25% APY",
    icon: "⚡",
    available: false,
  },
  {
    id: "sma-20",
    name: "SMA 20 Agent",
    strategy: "sma",
    description:
      "Employs Simple Moving Average with a 20-period window for medium-term trend analysis. Provides more stable signals with reduced noise compared to shorter periods.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.09,
    parameters: {
      period: 20,
    },
    features: [
      "Medium-term trend analysis",
      "Reduced false signals",
      "Balanced approach",
      "Suitable for swing trading",
    ],
    riskLevel: "Medium",
    avgReturns: "10-16% APY",
    icon: "📊",
    available: false,
  },
  {
    id: "ema-10",
    name: "EMA 10 Agent",
    strategy: "ema",
    description:
      "Utilizes Exponential Moving Average with a 10-period window, giving more weight to recent prices. Responds faster to price changes than SMA.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.12,
    parameters: {
      period: 10,
    },
    features: [
      "Fast price response",
      "Recent price emphasis",
      "Early trend detection",
      "Advanced momentum tracking",
    ],
    riskLevel: "High",
    avgReturns: "18-28% APY",
    icon: "🚀",
    available: false,
  },
  {
    id: "ema-20",
    name: "EMA 20 Agent",
    strategy: "ema",
    description:
      "Implements Exponential Moving Average with a 20-period window, balancing responsiveness with stability. Ideal for capturing medium-term trends with reduced whipsaws.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.11,
    parameters: {
      period: 20,
    },
    features: [
      "Balanced responsiveness",
      "Trend confirmation",
      "Reduced market noise",
      "Consistent performance",
    ],
    riskLevel: "Medium",
    avgReturns: "12-20% APY",
    icon: "🎯",
    available: false,
  },
  {
    id: "dynamic-tp-sl",
    name: "Dynamic TP/SL Agent",
    strategy: "dynamic_tp_sl",
    description:
      "Advanced AI that dynamically adjusts take profit and stop loss levels based on market volatility, volume, and momentum indicators. Adapts to changing market conditions in real-time.",
    walletAddress: process.env.NEXT_PUBLIC_AGENT_ADDRESS || "",
    price: 0.15,
    parameters: {},
    features: [
      "Adaptive risk management",
      "Real-time adjustments",
      "Multi-factor analysis",
      "Advanced AI algorithms",
      "Market condition awareness",
    ],
    riskLevel: "Low",
    avgReturns: "8-15% APY",
    icon: "🧠",
    available: false,
  },
];

export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case "Low":
      return "text-green-400 bg-green-500/10 border-green-500/20";
    case "Medium":
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    case "High":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
};

export const getStrategyDescription = (strategy: string): string => {
  switch (strategy) {
    case "trailing":
      return "Risk Management";
    case "sma":
      return "Trend Following";
    case "ema":
      return "Momentum Trading";
    case "dynamic_tp_sl":
      return "Adaptive AI";
    default:
      return "Unknown Strategy";
  }
};
