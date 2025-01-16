"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Users, BarChart2, Crown, Star, Filter, Search, Activity, DollarSign, Target, Zap, ChevronDown, Lock } from 'lucide-react';

// Sample token data
const tokenData = {
  BTC: {
    price: 42000,
    change24h: 2.5,
    predictions: [
      { date: '1/1', price: 40000, predictions: 35000 },
      { date: '1/2', price: 42000, predictions: 41000 },
      { date: '1/3', price: 41000, predictions: 43000 },
      { date: '1/4', price: 43000, predictions: 44000 },
      { date: '1/5', price: 45000, predictions: 46000 },
      { date: '1/6', price: 44000, predictions: 45000 },
    ],
  },
  ETH: {
    price: 2200,
    change24h: -1.2,
    predictions: [
      { date: '1/1', price: 2000, predictions: 1900 },
      { date: '1/2', price: 2100, predictions: 2200 },
      { date: '1/3', price: 2150, predictions: 2300 },
      { date: '1/4', price: 2180, predictions: 2250 },
      { date: '1/5', price: 2220, predictions: 2300 },
      { date: '1/6', price: 2200, predictions: 2400 },
    ],
  },
};

// Extended sample data
const predictionData = [
  {
    name: 'Michael Saylor',
    handle: '@saylor',
    avatar: '/api/placeholder/40/40',
    currentPrediction: '2.00%',
    weekChange: '+148bps',
    monthChange: '+108bps',
    accuracy: '92%',
    mindshare: '2.98%',
    tokens: ['BTC', 'ETH'],
    totalPredictions: 1247,
    successRate: 89,
    premium: true,
  },
  {
    name: 'CZ Binance',
    handle: '@cz_binance',
    avatar: '/api/placeholder/40/40',
    currentPrediction: '1.32%',
    weekChange: '+86bps',
    monthChange: '+77bps',
    accuracy: '88%',
    mindshare: '1.01%',
    tokens: ['BNB', 'BTC', 'ETH'],
    totalPredictions: 892,
    successRate: 85,
    premium: true,
  },
  {
    name: 'AI Alpha',
    handle: '@ai_alpha',
    avatar: '/api/placeholder/40/40',
    currentPrediction: '1.75%',
    weekChange: '+92bps',
    monthChange: '+82bps',
    accuracy: '94%',
    mindshare: '2.45%',
    tokens: ['BTC', 'ETH', 'SOL'],
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
      avatar: '/api/placeholder/40/40',
      currentPrediction: (Math.random() * 2).toFixed(2) + '%',
      weekChange: `+${(Math.random() * 100).toFixed(0)}bps`,
      monthChange: `+${(Math.random() * 100).toFixed(0)}bps`,
      accuracy: `${(Math.random() * 20 + 80).toFixed(1)}%`,
      mindshare: `${(Math.random() * 1).toFixed(2)}%`,
      tokens: ['BTC', 'ETH'].concat(Math.random() > 0.5 ? ['SOL'] : []),
      totalPredictions: Math.floor(Math.random() * 1000 + 100),
      successRate: Math.floor(Math.random() * 10 + 80),
      premium: Math.random() > 0.7,
      isAI: Math.random() > 0.8,
    }))
);

const marketStats = [
  { label: 'Total Predictions', value: '156.75K', change: '+30.20%', icon: BarChart2 },
  { label: 'Active Predictors', value: '14.17K', change: '+34.08%', icon: Users },
  { label: 'AI Agents', value: '2.5K', change: '+25.5%', icon: Zap },
  { label: 'Success Rate', value: '87.5%', change: '+5.2%', icon: Target },
  { label: 'Total Value Predicted', value: '$2.4B', change: '+12.8%', icon: DollarSign },
  { label: 'Avg. Prediction Time', value: '4.2 days', change: '-2.1%', icon: Clock },
];

export default function PredictionDashboard() {
  const [timeframe, setTimeframe] = useState('7D');
  const [selectedToken, setSelectedToken] = useState<'BTC' | 'ETH'>('BTC');
  const [view, setView] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/top100Influencers');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {marketStats.map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="text-blue-500" />
                <span className={`text-sm ${
                  stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Prediction Chart */}
          <div className="col-span-12 lg:col-span-8 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedToken}/USD Predictions</h2>
                <div className="text-sm text-gray-400">
                  Aggregated from {predictionData.length} predictors
                </div>
              </div>
              <div className="flex gap-2">
                {['24H', '7D', '30D', '3M', '6M'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 rounded-lg ${
                      timeframe === period 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokenData[selectedToken].predictions}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4B5563"/>
                  <YAxis stroke="#4B5563"/>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px'
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
                  <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={predictor.avatar}
                          className="w-10 h-10 rounded-full"
                          alt={predictor.name}
                        />
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
                          <p className="text-sm text-gray-400">{predictor.handle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-500">{predictor.currentPrediction}</p>
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
                        New prediction for <span className="text-blue-500">BTC</span>
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
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92.5%' }} />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Average Return</span>
                <span className="text-emerald-500">+18.3%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78.3%' }} />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-400">Risk Score</span>
                <span className="text-yellow-500">Medium</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }} />
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
                <BarChart data={[
                  { name: 'BTC', value: 45 },
                  { name: 'ETH', value: 30 },
                  { name: 'SOL', value: 15 },
                  { name: 'Others', value: 10 }
                ]}>
                  <XAxis dataKey="name" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px'
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
                'Real-time prediction alerts',
                'AI-powered market analysis',
                'Expert community access',
                'Advanced analytics dashboard',
                'Custom prediction strategies'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-300">
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
              <div className="text-sm text-emerald-500">+12.8% from last week</div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Active AI Agents</h3>
              <div className="text-2xl font-bold">2,547</div>
              <div className="text-sm text-emerald-500">+25.5% from last week</div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Prediction Accuracy</h3>
              <div className="text-2xl font-bold">92.5%</div>
              <div className="text-sm text-emerald-500">+2.3% from last week</div>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Community Members</h3>
              <div className="text-2xl font-bold">14,172</div>
              <div className="text-sm text-emerald-500">+34.1% from last week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}