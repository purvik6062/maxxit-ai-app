import { useEffect, useRef } from "react";

// Define TradingView widget interface
interface TradingViewWidget {
  widget: new (configuration: TradingViewConfig) => void;
}

// Define configuration interface for the widget
interface TradingViewConfig {
  container_id: string;
  symbol: string;
  theme: "light" | "dark";
  interval: string;
  width: string | number;
  height: string | number;
}

// Extend Window interface to include TradingView
declare global {
  interface Window {
    TradingView?: TradingViewWidget;
  }
}

const TradingViewChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;

      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            container_id: "tradingview-chart",
            symbol: "BTC", // Replace with desired symbol
            theme: "dark",
            interval: "D",  
            width: "100%",
            height: "500",
          });
        }
      };

      chartRef.current.appendChild(script);

      // Cleanup function to remove the script when component unmounts
      return () => {
        if (chartRef.current) {
          const scriptElement = chartRef.current.querySelector('script');
          if (scriptElement) {
            chartRef.current.removeChild(scriptElement);
          }
        }
      };
    }
  }, []);

  return <div id="tradingview-chart" ref={chartRef}></div>;
};

export default TradingViewChart;