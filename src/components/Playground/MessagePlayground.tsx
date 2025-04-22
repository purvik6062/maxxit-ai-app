"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Play, InfoIcon, Info, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import coins from "./coins.json";

// Example message that can be pasted into the analyzer
const exampleMessage = `🚨 Bullish Alert

Token: ZIG (zignaly)

Signal: Buy

Targets:
TP1: $0.0898
TP2: $0.1

Stop Loss: $0.079

Timeline: 1-2 weeks

Trade Tip: Bullish sentiment from chart strength and team commitment contrasts with recent 3.25% dip.Watch for key resistance at $0.0898 (next week prediction) and $0.10 (breakout zone). Maintain tight stop loss below $0.08 support given market volatility. Monitor volume spikes for confirmation.`;

function getCoinIdFromJson(tokenSymbol: string): string | null {
  const tokenSymbolLower = tokenSymbol.toLowerCase();
  const coin = coins.find(
    (coin) => coin.symbol.toLowerCase() === tokenSymbolLower
  );
  return coin ? coin.id : null;
}

const MessagePlayground = () => {
  const [telegramMessage, setTelegramMessage] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTelegramSimulate = async () => {
    setIsLoading(true);
    toast.info("Starting inference process...", {
      position: "top-center",
      autoClose: 3000,
    });

    try {
      const response = await fetch("https://ogxbt.xmutant.xyz/infer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: telegramMessage }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log("Raw inference response:", responseText);

      let data: { result: string };
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Failed to parse response as JSON");
      }

      console.log("Inference result:", data.result);

      let parsedResult: {
        tokenSymbol: any;
        signal: any;
        tp1: any;
        tp2: any;
        sl: any;
      };
      try {
        parsedResult = JSON.parse(data.result);
      } catch (parseError) {
        throw new Error("Failed to parse result as JSON");
      }

      if (
        parsedResult?.tokenSymbol &&
        parsedResult?.signal &&
        parsedResult?.tp1 &&
        parsedResult?.tp2 &&
        parsedResult?.sl
      ) {
        const tokenSymbolLower = parsedResult.tokenSymbol.toLowerCase();
        const coinId = getCoinIdFromJson(tokenSymbolLower);
        console.log("Coin ID: ", coinId);

        const processData = {
          signal_data: {
            tokenSymbol: parsedResult.tokenSymbol,
            signal: parsedResult.signal,
            tp1: parsedResult.tp1,
            tp2: parsedResult.tp2,
            sl: parsedResult.sl,
            tokenId: coinId,
          },
        };

        toast.info("Processing signal data...", {
          position: "top-center",
          autoClose: 3000,
        });

        const processResponse = await fetch("/api/process-telegram-signals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(processData),
        });

        if (!processResponse.ok) {
          throw new Error("Failed to process signals");
        }

        const processedData = await processResponse.json();
        setTableData([processedData.data]);
        setShowTable(true);
        toast.success("Signal processing completed! Displaying results...", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Invalid response format. Please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error during inference:", error);
      toast.error(`Failed to perform inference: ${error}`, {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E1D]">
      <div className="flex-grow px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="mb-6 text-center">
          <h2 className="text-xl md:text-4xl font-bold mb-2 font-sans">
            <span className="font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
              Signal Analyzer
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm font-leagueSpartan">
            Analyze trading signals from Telegram messages or other sources
          </p>
        </div>

        <div className="font-leagueSpartan bg-[#080A17] backdrop-blur-sm rounded-xl border border-[#171D3A] shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Signal Message Input :
                </label>
                <textarea
                  value={telegramMessage}
                  onChange={(e) => setTelegramMessage(e.target.value)}
                  placeholder="Paste your input signal message here..."
                  className="w-full h-40 p-4 bg-[#0B0E1D] text-gray-200 border border-[#171D3A] rounded-xl 
                            focus:ring-1 focus:ring-blue-400 focus:border-[#2B3566] resize-none 
                            transition-all duration-200 placeholder-gray-500"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {telegramMessage.length}/2000
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-[#0E1124] border border-[#171D3A] rounded-xl text-gray-200 text-sm">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#AAC9FA]" />
                <div>
                  <p className="font-medium text-white mb-1">Pro Tip</p>
                  <p className="text-gray-300">
                    Paste a message containing trading signals with Target Prices (TP), Stop Loss (SL), and other relevant data. Ensure the message includes:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                    <li>Clear token/crypto symbol (e.g., BTC, ETH)</li>
                    <li>Price targets and stop loss levels</li>
                    <li>Directional bias (Long/Short)</li>
                    <li>For example:</li>
                  </ul>

                  <pre className="mt-4 bg-[#0B0E1D] rounded-xl p-4 border border-[#171D3A] border-l-2 border-l-[#99BEF7] text-xs whitespace-pre-wrap">
                    <div className="flex items-start space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                      <div className="text-amber-400 font-semibold">Bullish Alert</div>
                    </div>

                    <div className="flex items-center space-x-2 my-2">
                      <div className="h-5 w-5 rounded-full bg-cyan-400 flex items-center justify-center">
                        <span className="text-xs text-[#0B0E1D] font-bold">₿</span>
                      </div>
                      <div className="text-cyan-400">Token: ZIG (zignaly)</div>
                    </div>

                    <div className="flex items-center space-x-2 my-2">
                      <div className="h-5 w-5 text-green-400">📈</div>
                      <div className="text-green-400">Signal: Buy</div>
                    </div>

                    <div className="flex items-center space-x-2 my-2">
                      <div className="h-5 w-5 text-blue-400">🎯</div>
                      <div className="text-white">Targets:</div>
                    </div>
                    <div className="ml-7">
                      <div className="text-white">TP1: $0.0898</div>
                      <div className="text-white">TP2: $0.1</div>
                    </div>

                    <div className="flex items-center space-x-2 my-2">
                      <div className="h-5 w-5 text-red-400">🛑</div>
                      <div className="text-red-400">Stop Loss: $0.079</div>
                    </div>

                    <div className="flex items-center space-x-2 my-2">
                      <div className="h-5 w-5 text-purple-400">⏳</div>
                      <div className="text-purple-400">Timeline: 1-2 weeks</div>
                    </div>

                    <div className="flex items-start space-x-2 my-2">
                      <div className="h-5 w-5 text-yellow-400">💡</div>
                      <div className="text-yellow-400 text-sm">Trade Tip: Bullish sentiment from chart strength and team commitment contrasts with recent 3.25% dip.Watch for key resistance at $0.0898 (next week prediction) and $0.10 (breakout zone). Maintain tight stop loss below $0.08 support given market volatility. Monitor volume spikes for confirmation.</div>
                    </div>
                  </pre>
                </div>
              </div>

              <button
                onClick={handleTelegramSimulate}
                disabled={!telegramMessage || isLoading}
                className={`w-full group relative overflow-hidden rounded-xl p-0.5 transition-all duration-300 
                  ${telegramMessage && !isLoading
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-[#171D3A] cursor-not-allowed opacity-75"
                  }`}
              >
                <div
                  className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl transition-all
                  ${telegramMessage && !isLoading
                      ? "bg-blue-500"
                      : "bg-[#171D3A] text-gray-500"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                      <span className="font-medium text-white">Analyzing Content...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-white" />
                      <span className="font-medium text-white">
                        Analyze Message
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {showTable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-8 relative overflow-hidden rounded-2xl border border-[#171D3A] bg-[#0B0E1D]"
              >
                <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#171D3A] text-sm">
                      <tr>
                        {[
                          "Signal",
                          "Token",
                          "Current",
                          "TP1",
                          "TP2",
                          "SL",
                          "Exit",
                          "P&L",
                        ].map((header) => (
                          <th
                            key={header}
                            className="py-4 px-5 font-medium text-gray-400 bg-[#080A17] sticky top-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#171D3A]/50">
                      {tableData.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#0E1124] transition-colors"
                        >
                          <td className="py-4 px-5 text-gray-300 max-w-xs truncate">
                            {row.signal}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300">{row.tokenSymbol}</span>
                              <span className="text-xs text-gray-500">
                                ({row.tokenId})
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono text-gray-300">
                            ${row.currentPrice}
                          </td>
                          <td className="py-4 px-5 font-mono text-green-400">
                            ${row.tp1}
                          </td>
                          <td className="py-4 px-5 font-mono text-green-400">
                            ${row.tp2}
                          </td>
                          <td className="py-4 px-5 font-mono text-red-400">
                            ${row.sl}
                          </td>
                          <td className="py-4 px-5 font-mono text-purple-400">
                            ${row.exit_price}
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2 py-1 rounded-md text-sm font-medium ${parseFloat(row.p_and_l) >= 0
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                                }`}
                            >
                              {row.p_and_l}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0B0E1D] pointer-events-none" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePlayground;
