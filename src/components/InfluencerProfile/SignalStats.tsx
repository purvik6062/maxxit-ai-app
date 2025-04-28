"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  RefreshCcw,
  CoinsIcon,
  DollarSign,
  Clock
} from "lucide-react";

interface SignalStatsProps {
  influencerId: string;
}

interface TokenStat {
  tokenId: string;
  tokenName: string;
  count: number;
}

interface DayStat {
  date: string;
  signalCount: number;
  tokens: TokenStat[];
  isExpanded?: boolean;
}

function SignalStats({ influencerId }: SignalStatsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [topTokens, setTopTokens] = useState<TokenStat[]>([]);
  const [totalSignals, setTotalSignals] = useState(0);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!influencerId) {
      setError("No influencer ID provided");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log("Fetching signal stats for:", influencerId);
        const response = await fetch(`/api/get-influencer-signals-stats/${influencerId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch signal stats: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Signal stats received:", data);
        
        if (data.stats.length === 0) {
          setStats([]);
          setTopTokens([]);
          setTotalSignals(0);
        } else {
          setStats(data.stats);
          setTopTokens(data.tokenStats || []);
          setTotalSignals(data.totalSignals || 0);
          
          // By default expand the most recent day
          if (data.stats.length > 0) {
            const latestDay = data.stats[0].date;
            setExpandedDays({ [latestDay]: true });
          }
        }
        
        setError(null);
      } catch (error) {
        console.error("Error fetching signal stats:", error);
        setError(error instanceof Error ? error.message : "Failed to load signal statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [influencerId]);

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto my-6 bg-gray-950/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800/50 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading signal statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto my-6 bg-gray-950/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800/50">
        <div className="text-center py-4">
          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/30 inline-block">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="max-w-6xl mx-auto my-6 bg-gray-950/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800/50">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold text-gray-300 mb-2">No Signals Yet</h2>
          <p className="text-gray-400">This influencer hasn't generated any trading signals yet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto my-6 bg-gray-950/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-800/50"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <BarChart className="w-6 h-6 mr-2 text-blue-500" />
            Signal Statistics
          </h2>
          <p className="text-gray-400 mt-1">
            {totalSignals} total trading signals
          </p>
        </div>
        
        {topTokens.length > 0 && (
          <div className="mt-4 md:mt-0 bg-gray-900/50 p-3 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">Top Tokens:</p>
            <div className="flex flex-wrap gap-2">
              {topTokens.slice(0, 3).map(token => (
                <div 
                  key={token.tokenId} 
                  className="px-3 py-1 bg-gray-800 rounded-full text-xs text-white flex items-center"
                >
                  <CoinsIcon className="w-3 h-3 mr-1 text-yellow-500" />
                  {token.tokenName} ({token.count})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Signals</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 hidden md:table-cell">Tokens</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {stats.map((day, index) => (
              <React.Fragment key={day.date}>
                <tr 
                  className={`border-t border-gray-800 ${index % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/50'} cursor-pointer hover:bg-gray-800/50 transition-colors`}
                  onClick={() => toggleDayExpansion(day.date)}
                >
                  <td className="px-4 py-3 text-white">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      {format(parseISO(day.date), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="bg-blue-500/10 text-blue-400 rounded-full px-2 py-1 inline-flex items-center text-sm">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {day.signalCount} {day.signalCount === 1 ? 'signal' : 'signals'}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {day.tokens.slice(0, 2).map(token => (
                        <span 
                          key={token.tokenId} 
                          className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
                        >
                          {token.tokenName}
                        </span>
                      ))}
                      {day.tokens.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-500">
                          +{day.tokens.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {expandedDays[day.date] ? 
                      <ChevronUp className="w-5 h-5 text-gray-400 inline-block" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400 inline-block" />
                    }
                  </td>
                </tr>
                {expandedDays[day.date] && (
                  <tr className="bg-gray-950/70 border-t border-gray-800">
                    <td colSpan={4} className="p-0">
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-green-500" />
                          Trading Signals on {format(parseISO(day.date), 'MMMM dd, yyyy')}
                        </h3>
                        <div className="space-y-3">
                          {day.tokens.map(token => (
                            <div 
                              key={token.tokenId} 
                              className="p-3 rounded-lg bg-gray-900/50 border border-gray-800/80"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-white flex items-center">
                                    <CoinsIcon className="w-4 h-4 mr-2 text-yellow-500" /> 
                                    {token.tokenName}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    ID: {token.tokenId}
                                  </div>
                                </div>
                                <div className="bg-green-900/30 text-green-500 px-3 py-1 rounded-full text-sm">
                                  {token.count} {token.count === 1 ? 'signal' : 'signals'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default SignalStats; 