import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  Clock,
  Users,
  BarChart2,
  Crown,
  Star,
  Filter,
  Activity,
  DollarSign,
  Target,
  Zap,
  ChevronDown,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  Heart,
  Repeat2,
  Eye,
  AlertCircle,
} from "lucide-react";
import TradingViewChart from "./TradingViewChart ";

interface TokenData {
  price: number;
  change24h: number;
  predictions: {
    date: string;
    price: number;
    predictions: number;
  }[];
}

interface TokenDataMap {
  [key: string]: TokenData;
}

interface Predictor {
  name: string;
  handle: string;
  avatar: string;
  currentPrediction: string;
  weekChange: string;
  monthChange: string;
  accuracy: string;
  mindshare: string;
  tokens: string[];
  totalPredictions: number;
  successRate: number;
  premium: boolean;
  isAI?: boolean;
}

interface MarketStat {
  label: string;
  value: string;
  change: string;
  icon: React.FC<any>;
}

interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
  views: number;
}

interface TokenAnalysis {
  token: string;
  analysis: {
    direction: "bullish" | "bearish";
    action: "buy" | "sell";
    timeframe: "short-term" | "long-term";
    confidence: number;
    risk_level: "low" | "medium" | "high";
  };
  market_data: {
    current_price: number;
    price_change_24h_percentage: number;
    market_cap: number;
    total_volume: number;
  };
}

interface Signal {
  timestamp: string;
  original_tweet: string;
  contains_trading_signal: boolean;
  token_analysis?: TokenAnalysis[];
  tweet_metrics: TweetMetrics;
  message?: string;
}

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

// Sample token data
const tokenData: TokenDataMap = {
  BTC: {
    price: 42000,
    change24h: 2.5,
    predictions: [
      { date: "1/1", price: 40000, predictions: 35000 },
      { date: "1/2", price: 42000, predictions: 41000 },
      { date: "1/3", price: 41000, predictions: 43000 },
      { date: "1/4", price: 43000, predictions: 44000 },
      { date: "1/5", price: 45000, predictions: 46000 },
      { date: "1/6", price: 44000, predictions: 45000 },
    ],
  },
  ETH: {
    price: 2200,
    change24h: -1.2,
    predictions: [
      { date: "1/1", price: 2000, predictions: 1900 },
      { date: "1/2", price: 2100, predictions: 2200 },
      { date: "1/3", price: 2150, predictions: 2300 },
      { date: "1/4", price: 2180, predictions: 2250 },
      { date: "1/5", price: 2220, predictions: 2300 },
      { date: "1/6", price: 2200, predictions: 2400 },
    ],
  },
};

// Extended sample data
const predictionData: Predictor[] = [
  {
    name: "Michael Saylor",
    handle: "@saylor",
    avatar: "/api/placeholder/40/40",
    currentPrediction: "2.00%",
    weekChange: "+148bps",
    monthChange: "+108bps",
    accuracy: "92%",
    mindshare: "2.98%",
    tokens: ["BTC", "ETH"],
    totalPredictions: 1247,
    successRate: 89,
    premium: true,
  },
  {
    name: "CZ Binance",
    handle: "@cz_binance",
    avatar: "/api/placeholder/40/40",
    currentPrediction: "1.32%",
    weekChange: "+86bps",
    monthChange: "+77bps",
    accuracy: "88%",
    mindshare: "1.01%",
    tokens: ["BNB", "BTC", "ETH"],
    totalPredictions: 892,
    successRate: 85,
    premium: true,
  },
  {
    name: "AI Alpha",
    handle: "@ai_alpha",
    avatar: "/api/placeholder/40/40",
    currentPrediction: "1.75%",
    weekChange: "+92bps",
    monthChange: "+82bps",
    accuracy: "94%",
    mindshare: "2.45%",
    tokens: ["BTC", "ETH", "SOL"],
    totalPredictions: 2891,
    successRate: 91,
    premium: true,
    isAI: true,
  },
].concat(
  Array(20)
    .fill(null)
    .map((_, i) => ({
      name: `Predictor ${i + 4}`,
      handle: `@predictor${i + 4}`,
      avatar: "/api/placeholder/40/40",
      currentPrediction: (Math.random() * 2).toFixed(2) + "%",
      weekChange: `+${(Math.random() * 100).toFixed(0)}bps`,
      monthChange: `+${(Math.random() * 100).toFixed(0)}bps`,
      accuracy: `${(Math.random() * 20 + 80).toFixed(1)}%`,
      mindshare: `${(Math.random() * 1).toFixed(2)}%`,
      tokens: ["BTC", "ETH"].concat(Math.random() > 0.5 ? ["SOL"] : []),
      totalPredictions: Math.floor(Math.random() * 1000 + 100),
      successRate: Math.floor(Math.random() * 10 + 80),
      premium: Math.random() > 0.7,
      isAI: Math.random() > 0.8,
    }))
);

const marketStats: MarketStat[] = [
  {
    label: "Total Predictions",
    value: "156.75K",
    change: "+30.20%",
    icon: BarChart2,
  },
  {
    label: "Active Predictors",
    value: "14.17K",
    change: "+34.08%",
    icon: Users,
  },
  { label: "AI Agents", value: "2.5K", change: "+25.5%", icon: Zap },
  { label: "Success Rate", value: "87.5%", change: "+5.2%", icon: Target },
  {
    label: "Total Value Predicted",
    value: "$2.4B",
    change: "+12.8%",
    icon: DollarSign,
  },
  {
    label: "Avg. Prediction Time",
    value: "4.2 days",
    change: "-2.1%",
    icon: Clock,
  },
];

const COINGECKO_API_KEY = "CG-Wb3ZDGXhHgXANkUipBfQ35TN";

export default function PredictionDashboard() {
  const [timeframe, setTimeframe] = useState("7D");
  const [selectedToken, setSelectedToken] = useState("BTC");
  const [view, setView] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  const signals: Signal[] = [
    {
      timestamp: "2025-01-09T17:47:58.373Z",
      original_tweet:
        "If you're an AI Agent, pivot to DeFAI. https://t.co/J0e3jUQQI6",
      contains_trading_signal: false,
      message: "No trading signals detected",
      tweet_metrics: {
        likes: 118,
        retweets: 13,
        replies: 24,
        views: 7156,
      },
    },
    {
      timestamp: "2025-01-09T17:48:01.400Z",
      original_tweet:
        "$VU is currently trading at $7M MCap, up 21% in the last 24 hrs.",
      contains_trading_signal: true,
      token_analysis: [
        {
          token: "vu",
          analysis: {
            direction: "bullish",
            action: "buy",
            timeframe: "short-term",
            confidence: 24,
            risk_level: "medium",
          },
          market_data: {
            current_price: 0.0075001,
            price_change_24h_percentage: 21.08452,
            market_cap: 7455986,
            total_volume: 144110,
          },
        },
      ],
      tweet_metrics: {
        likes: 27,
        retweets: 1,
        replies: 15,
        views: 4727,
      },
    },
  ];

  const generatePriceData = (
    initialPrice: number,
    trend: "up" | "down" = "up"
  ): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    let price = initialPrice;
    for (let i = 0; i < 24; i++) {
      price = price * (1 + (trend === "up" ? 0.02 : -0.02) * Math.random());
      data.push({
        time: `${i}h`,
        price: price,
        volume: Math.random() * 10000,
      });
    }
    return data;
  };

  const getSignalColor = (analysis?: TokenAnalysis["analysis"]): string => {
    if (!analysis) return "bg-gray-600";

    if (analysis.direction === "bullish") {
      return analysis.timeframe === "short-term"
        ? "bg-yellow-500"
        : "bg-emerald-500";
    }
    return "bg-red-500";
  };

  const getSignalGradient = (
    analysis?: TokenAnalysis["analysis"]
  ): [string, string] => {
    if (!analysis) return ["#374151", "#1F2937"];

    if (analysis.direction === "bullish") {
      return analysis.timeframe === "short-term"
        ? ["#F59E0B", "#B45309"]
        : ["#10B981", "#059669"];
    }
    return ["#EF4444", "#B91C1C"];
  };

  // useEffect(() => {
  //   const fetchCoinData = async () => {
  //     try {
  //       setLoading(true);

  //       // Calculate timestamps for the last 24 hours
  //       const now = Math.floor(Date.now() / 1000);
  //       const oneDayAgo = now - (24 * 60 * 60);

  //       console.log(COINGECKO_API_KEY);

  //       const options = {
  //         method: 'GET',
  //         headers: {
  //           'accept': 'application/json',
  //           'x-cg-pro-api-key': COINGECKO_API_KEY
  //         }
  //       };

  //       // Using the pro API endpoint with range
  //       const response = await fetch(
  //         `https://pro-api.coingecko.com/api/v3/coins/velvet-unicorn-by-virtuals/market_chart/range?vs_currency=usd&days=1`,
  //         options
  //       );

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         throw new Error(errorData.error || 'Failed to fetch data');
  //       }

  //       const data = await response.json();

  //       // Transform the data for Recharts
  //       const transformedData = data.prices.map((item, index) => ({
  //         timestamp: item[0],
  //         time: formatTimestamp(item[0]),
  //         price: item[1],
  //         marketCap: data.market_caps[index][1],
  //         volume: data.total_volumes[index][1]
  //       }));

  //       setChartData(transformedData);
  //     } catch (err) {
  //       setError(err.message);
  //       console.error('Error fetching data:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCoinData();

  //   // Set up polling every 5 minutes
  //   const pollInterval = setInterval(fetchCoinData, 5 * 60 * 1000);

  //   // Cleanup interval on component unmount
  //   return () => clearInterval(pollInterval);
  // }, []); // Empty dependency array means this runs once on mount

  // const renderChart = (dataKey, color, gradient = false) => {
  //   if (!chartData) return null;

  //   return (
  //     <div className="bg-gray-800 rounded-lg p-4 h-48">
  //       <div className="text-sm text-gray-400 mb-2">
  //         {dataKey.charAt(0).toUpperCase() + dataKey.slice(1)} (24h)
  //       </div>
  //       <ResponsiveContainer width="100%" height="100%">
  //         {gradient ? (
  //           <AreaChart data={chartData}>
  //             <defs>
  //               <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
  //                 <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
  //                 <stop offset="95%" stopColor={color} stopOpacity={0}/>
  //               </linearGradient>
  //             </defs>
  //             <XAxis dataKey="time" stroke="#4B5563" />
  //             <YAxis
  //               stroke="#4B5563"
  //               tickFormatter={formatNumber}
  //             />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: '#1F2937',
  //                 border: 'none',
  //                 borderRadius: '8px'
  //               }}
  //               formatter={(value) => formatNumber(value)}
  //             />
  //             <Area
  //               type="monotone"
  //               dataKey={dataKey}
  //               stroke={color}
  //               fill={`url(#gradient-${dataKey})`}
  //             />
  //           </AreaChart>
  //         ) : (
  //           <LineChart data={chartData}>
  //             <XAxis dataKey="time" stroke="#4B5563" />
  //             <YAxis
  //               stroke="#4B5563"
  //               tickFormatter={formatNumber}
  //             />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: '#1F2937',
  //                 border: 'none',
  //                 borderRadius: '8px'
  //               }}
  //               formatter={(value) => formatNumber(value)}
  //             />
  //             <Line
  //               type="monotone"
  //               dataKey={dataKey}
  //               stroke={color}
  //               dot={false}
  //             />
  //           </LineChart>
  //         )}
  //       </ResponsiveContainer>
  //     </div>
  //   );
  // };

  // if (loading && !chartData) {
  //   return <div className="text-center p-6">Loading charts...</div>;
  // }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-500 mb-2">Error: {error}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {marketStats.map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="text-blue-500" />
                <span
                  className={`text-sm ${
                    stat.change.startsWith("+")
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  {selectedToken}/USD Predictions
                </h2>
                <div className="text-sm text-gray-400">
                  Aggregated from {predictionData.length} predictors
                </div>
              </div>
              <div className="flex gap-2">
                {["24H", "7D", "30D", "3M", "6M"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 rounded-lg ${
                      timeframe === period
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={tokenData[selectedToken].predictions}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                  <Area
                    type="monotone"
                    dataKey="predictions"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorPred)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-10">
                <TradingViewChart />
              </div>
            </div>
          </div>

          {/* Top Predictors */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Top Predictors</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-4">
                {predictionData.slice(0, 5).map((predictor, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* <img
                          src={predictor.avatar}
                          className="w-10 h-10 rounded-full"
                          alt={predictor.name}
                        /> */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{predictor.name}</h3>
                            {predictor.premium && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {predictor.isAI && (
                              <Zap className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {predictor.handle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-500">
                          {predictor.currentPrediction}
                        </p>
                        <p className="text-sm text-gray-400">
                          Success: {predictor.successRate}%
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span>{predictor.totalPredictions}</span>
                      </div>
                      <div className="flex gap-1">
                        {predictor.tokens.map((token) => (
                          <span
                            key={token}
                            className="px-2 py-1 bg-gray-800 rounded text-xs"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-blue-500 hover:text-blue-400">
                View All Predictors
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <Activity className="text-blue-500" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm">
                        New prediction for{" "}
                        <span className="text-blue-500">BTC</span>
                      </p>
                      <p className="text-xs text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Prediction Performance */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Performance Metrics</h2>
              <Target className="text-purple-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accuracy Rate</span>
                <span className="text-emerald-500">92.5%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: "92.5%" }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Average Return</span>
                <span className="text-emerald-500">+18.3%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "78.3%" }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Risk Score</span>
                <span className="text-yellow-500">Medium</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>

          {/* Token Distribution */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Token Distribution</h2>
              <DollarSign className="text-green-500" />
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "BTC", value: 45 },
                    { name: "ETH", value: 30 },
                    { name: "SOL", value: 15 },
                    { name: "Others", value: 10 },
                  ]}
                >
                  <XAxis dataKey="name" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Premium Features */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Premium Features</h2>
              <Lock className="text-yellow-500" />
            </div>
            <div className="space-y-4">
              {[
                "Real-time prediction alerts",
                "AI-powered market analysis",
                "Expert community access",
                "Advanced analytics dashboard",
                "Custom prediction strategies",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{feature}</span>
                </div>
              ))}
              <button className="w-full mt-4 py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-gray-400 mb-2">Total Value Predicted</h3>
              <div className="text-2xl font-bold">$2.4B</div>
              <div className="text-sm text-emerald-500">
                +12.8% from last week
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Active AI Agents</h3>
              <div className="text-2xl font-bold">2,547</div>
              <div className="text-sm text-emerald-500">
                +25.5% from last week
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Prediction Accuracy</h3>
              <div className="text-2xl font-bold">92.5%</div>
              <div className="text-sm text-emerald-500">
                +2.3% from last week
              </div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Community Members</h3>
              <div className="text-2xl font-bold">14,172</div>
              <div className="text-sm text-emerald-500">
                +34.1% from last week
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Trading Signals</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-400">Buy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-400">Short-term</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-400">Sell</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {signals.map((signal: any, index: any) => (
              <div
                key={index}
                className={`bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors relative overflow-hidden ${
                  signal.contains_trading_signal
                    ? "border-l-4 border-" +
                      (signal.token_analysis[0].analysis.direction === "bullish"
                        ? "emerald"
                        : "red") +
                      "-500"
                    : ""
                }`}
              >
                {signal.contains_trading_signal ? (
                  <>
                    <div className="absolute top-0 right-0 p-2">
                      <div
                        className={`${getSignalColor(
                          signal.token_analysis[0].analysis
                        )} text-white px-4 py-1 rounded-full text-sm font-semibold`}
                      >
                        {signal.token_analysis[0].analysis.direction.toUpperCase()}{" "}
                        •{" "}
                        {signal.token_analysis[0].analysis.timeframe.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Signal Info */}
                      <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`${getSignalColor(
                              signal.token_analysis[0].analysis
                            )} rounded-full p-3`}
                          >
                            {signal.token_analysis[0].analysis.direction ===
                            "bullish" ? (
                              <ArrowUpRight className="w-6 h-6" />
                            ) : (
                              <ArrowDownRight className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              ${signal.token_analysis[0].token.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(signal.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="text-gray-400 mb-2">
                              Price Change (24h)
                            </div>
                            <div className="text-2xl font-bold text-emerald-500">
                              +
                              {signal.token_analysis[0].market_data.price_change_24h_percentage.toFixed(
                                2
                              )}
                              %
                            </div>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="text-gray-400 mb-2">
                              Signal Confidence
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-600 rounded-full h-2">
                                <div
                                  className={`${getSignalColor(
                                    signal.token_analysis[0].analysis
                                  )} h-2 rounded-full`}
                                  style={{
                                    width: `${signal.token_analysis[0].analysis.confidence}%`,
                                  }}
                                />
                              </div>
                              <span className="text-lg font-bold">
                                {signal.token_analysis[0].analysis.confidence}%
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="text-gray-400 mb-2">Risk Level</div>
                            <div className="flex items-center gap-2">
                              <AlertCircle
                                className={`${
                                  signal.token_analysis[0].analysis
                                    .risk_level === "high"
                                    ? "text-red-500"
                                    : signal.token_analysis[0].analysis
                                        .risk_level === "medium"
                                    ? "text-yellow-500"
                                    : "text-emerald-500"
                                }`}
                              />
                              <span className="text-lg font-bold capitalize">
                                {signal.token_analysis[0].analysis.risk_level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Charts */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="bg-gray-800 rounded-lg p-4 h-48">
                          <div className="text-sm text-gray-400 mb-2">
                            Price Action (24h)
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={generatePriceData(
                                signal.token_analysis[0].market_data
                                  .current_price
                              )}
                            >
                              <defs>
                                <linearGradient
                                  id={`gradient-${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={
                                      getSignalGradient(
                                        signal.token_analysis[0].analysis
                                      )[0]
                                    }
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={
                                      getSignalGradient(
                                        signal.token_analysis[0].analysis
                                      )[1]
                                    }
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" stroke="#4B5563" />
                              <YAxis stroke="#4B5563" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  border: "none",
                                  borderRadius: "8px",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="price"
                                stroke={
                                  getSignalGradient(
                                    signal.token_analysis[0].analysis
                                  )[0]
                                }
                                fill={`url(#gradient-${index})`}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-4 h-32">
                          <div className="text-sm text-gray-400 mb-2">
                            Volume
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={generatePriceData(
                                signal.token_analysis[0].market_data
                                  .current_price
                              )}
                            >
                              <XAxis dataKey="time" stroke="#4B5563" />
                              <YAxis stroke="#4B5563" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  border: "none",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar dataKey="volume" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <p className="text-gray-300 mb-4">
                        {signal.original_tweet}
                      </p>
                      <div className="flex items-center justify-between text-gray-400 text-sm">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{signal.tweet_metrics.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="w-4 h-4" />
                            <span>{signal.tweet_metrics.retweets}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{signal.tweet_metrics.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{signal.tweet_metrics.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-300">{signal.original_tweet}</p>
                    <div className="text-sm text-gray-400">
                      {new Date(signal.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
