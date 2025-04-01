"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Play, InfoIcon, Info } from "lucide-react";
import { toast } from "react-toastify";
import coins from "./coins.json";

const alertMessage = `🚀 Bullish Alert 🚀\n🏛️ Token: ZIG (zignaly)\n📈 Signal: Buy\n🎯 Targets:\nTP1: $0.0898\nTP2: $0.1\n🛑 Stop Loss: $0.079\n⏳ Timeline: 1-2 weeks\n💡 Trade Tip: Bullish sentiment from chart strength and team commitment contrasts with recent 3.25% dip.Watch for key resistance at $0.0898 (next week prediction) and $0.10 (breakout zone). Maintain tight stop loss below $0.08 support given market volatility. Monitor volume spikes for confirmation.`;

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
    <div className="space-y-8 max-w-4xl mx-auto px-4 min-h-screen border border-white border-solid rounded-lg py-4 my-12">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-100">Signal Analyzer</h1>
        </div>

        <div className="relative group">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Signal Message Input
          </label>
          <textarea
            value={telegramMessage}
            onChange={(e) => setTelegramMessage(e.target.value)}
            placeholder="Paste your signal message here..."
            className="w-full h-40 p-4 bg-gray-900/80 backdrop-blur-sm text-gray-200 border border-solid border-gray-400 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-transparent resize-none 
                      ring-offset-1 ring-offset-gray-900 transition-all duration-200 placeholder-gray-500
                      hover:border-gray-600 focus:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-500">
            {telegramMessage.length}/2000
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-800/50 border border-solid border-gray-400 rounded-xl text-yellow-100 text-sm backdrop-blur-sm">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-300 mb-1">Pro Tip</p>
            <p className="text-yellow-100/95">
              Paste a message containing trading signals with Target Prices
              (TP), Stop Loss (SL), and other relevant data. Ensure the message
              includes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-100/90">
              <li>Clear token/crypto symbol (e.g., BTC, ETH)</li>
              <li>Price targets and stop loss levels</li>
              <li>Directional bias (Long/Short)</li>
              <li>
                For example:
                <pre className="whitespace-pre-wrap">{alertMessage}</pre>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleTelegramSimulate}
          disabled={!telegramMessage || isLoading}
          className={`w-full group relative overflow-hidden rounded-xl p-px transition-all duration-300 
            ${
              telegramMessage && !isLoading
                ? "bg-gradient-to-r from-blue-300 to-cyan-400 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)]"
                : "bg-gray-800 cursor-not-allowed opacity-75"
            }`}
        >
          <div
            className={`flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-[11px] transition-all
            ${
              telegramMessage && !isLoading
                ? "bg-gray-900 hover:bg-gray-900/90"
                : "bg-gray-800/50 text-gray-500"
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                <span className="font-medium">Analyzing Content...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-cyan-400" />
                <span className="font-medium bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
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
          className="mt-8 relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/20 backdrop-blur-sm"
        >
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left">
              <thead className="border-b border-gray-800 text-sm">
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
                      className="py-4 px-5 font-medium text-gray-400 bg-gray-900/30 backdrop-blur-sm sticky top-0"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-800/20 transition-colors"
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
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          parseFloat(row.p_and_l) >= 0
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
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-900/80 pointer-events-none" />
        </motion.div>
      )}
    </div>
  );
};

export default MessagePlayground;
