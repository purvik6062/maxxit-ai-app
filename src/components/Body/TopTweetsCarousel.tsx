"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/autoplay'

interface Agent {
  name: string
  handle: string
  avatar: string
}

interface AgentPerformance {
  id: string
  agent: Agent
  gmxProfit: number
  hyperliquidProfit: number
  spotTradingProfit: number
  totalPnl: number
  timestamp: string
}

export default function CarouselHorizontal() {
  const [agentPerformances, setAgentPerformances] = useState<AgentPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef<any>(null) // Reference to Swiper instance

  useEffect(() => {
    const generateAgentPerformances = () => {
      const agentNames = [
        "PumpDomains44",
        "johnhill_01",
        "chain_haya",
        "abhip05",
        "anoncptn",
        "maxxitAI"
      ]

      // Function to get consistent avatar for each agent
      const getAgentAvatar = (agentName: string): string => {
        const avatarMap: { [key: string]: number } = {
          "PumpDomains44": 1,
          "johnhill_01": 2,
          "chain_haya": 3,
          "abhip05": 5,
          "anoncptn": 4,
          "maxxitAI": 6
        }
        return `https://picsum.photos/200/200?random=${avatarMap[agentName]}`
      }

      // Fixed performance data for consistency
      const agentPerformanceData = [
        { gmxProfit: 45, hyperliquidProfit: 67, spotTradingProfit: 23 },
        { gmxProfit: -180, hyperliquidProfit: 89, spotTradingProfit: 54 },
        { gmxProfit: 78, hyperliquidProfit: -23, spotTradingProfit: 56 },
        { gmxProfit: -5, hyperliquidProfit: 123, spotTradingProfit: 67 },
        { gmxProfit: 34, hyperliquidProfit: -45, spotTradingProfit: -8 },
        { gmxProfit: 156, hyperliquidProfit: 78, spotTradingProfit: 45 }
      ]

      const performances: AgentPerformance[] = agentNames.map((name, index) => {
        const performanceData = agentPerformanceData[index]
        const totalPnl = performanceData.gmxProfit + performanceData.hyperliquidProfit + performanceData.spotTradingProfit

        return {
          id: `agent-${index + 1}`,
          agent: {
            name: name,
            handle: name.toLowerCase(),
            avatar: getAgentAvatar(name)
          },
          gmxProfit: performanceData.gmxProfit,
          hyperliquidProfit: performanceData.hyperliquidProfit,
          spotTradingProfit: performanceData.spotTradingProfit,
          totalPnl: totalPnl,
          timestamp: new Date().toISOString()
        }
      })

      return performances
    }

    // Simulate loading delay for better UX
    const loadData = async () => {
      setLoading(true)
      
      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const data = generateAgentPerformances()
      setAgentPerformances(data)
      setLoading(false)
    }

    loadData()
  }, [])

  // Add resize event listener to restart autoplay
  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.start()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const duplicatedPerformances = [...agentPerformances, ...agentPerformances, ...agentPerformances]

  const formatPnL = (pnl: number) => {
    // console.log("pnl", pnl)
    if (pnl === null || pnl === undefined || isNaN(pnl)) {
      return "0.00"
    }
    return pnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      date.setHours(date.getHours() + 5)
      date.setMinutes(date.getMinutes() + 30)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="bg-transparent rounded-xl border border-gray-800/30 shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mb-4 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
            <Loader2 className="w-14 h-14 text-blue-500/70 animate-spin absolute inset-0" />
          </div>
          <h3 className="text-xl font-medium text-gray-200 mb-1">Loading Data</h3>
          <p className="text-gray-400 text-sm">Fetching Top Tweets...</p>
        </div>
      </div>
    )
  }

  if (agentPerformances.length === 0) {
    return (
      <div className="w-full overflow-hidden py-8">
        <div className="container mx-auto px-4 mb-6 flex justify-center">
          <div className="text-white/60 text-lg">No agent data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-[#020617] py-8 mt-[3rem]">
      <div className="container mx-auto px-4 mb-6 flex flex-col gap-[0.5rem] items-center justify-center text-center md:text-left">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AI Trading Agents Performance
        </h2>
        <p className="text-white/60 text-base md:text-lg mt-[4px]">Real-time performance metrics across GMX, Hyperliquid & Spot Trading</p>
      </div>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={24}
        slidesPerView="auto"
        loop={true}
        speed={6000} // Transition duration of 1 second
        autoplay={{
          delay: 100, // 100ms delay between transitions
          disableOnInteraction: false,
          reverseDirection: false,
          waitForTransition: true,
          pauseOnMouseEnter: false,
        }}
        className="mySwiper py-4 mt-[2rem]"
        allowTouchMove={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper // Store Swiper instance in ref
        }}
      >
        {duplicatedPerformances.map((performance, index) => (
          <SwiperSlide
            key={`${performance.id}-${index}`}
            className="!w-[280px] sm:!w-[320px] md:!w-[380px]"
          >
            <div className="flex-shrink-0 w-full bg-gradient-to-br from-[#0a101f] to-[#020617] rounded-xl border border-[#1a2035] shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#1a2035]">
                    <Image
                      src={performance.agent.avatar || "/placeholder.svg"}
                      alt={performance.agent.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium truncate max-w-[180px]">{performance.agent.name}</p>
                    <p className="text-white/60 text-sm truncate max-w-[180px]">@{performance.agent.handle}</p>
                  </div>
                  <div className="ml-auto">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#0a101f]/50 rounded-lg p-3">
                  <div>
                    <div className="flex flex-col space-y-1 mt-1 text-left">
                      <div className="text-sm">
                        <span className="text-purple-400 font-medium">GMX: </span>
                        <span className={`font-semibold ${performance.gmxProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {performance.gmxProfit >= 0 ? '+' : ''}{formatPnL(performance.gmxProfit)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-cyan-300/80 font-medium">Hyperliquid: </span>
                        <span className={`font-semibold ${performance.hyperliquidProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {performance.hyperliquidProfit >= 0 ? '+' : ''}{formatPnL(performance.hyperliquidProfit)}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-orange-300/80 font-medium">Spot Trading: </span>
                        <span className={`font-semibold ${performance.spotTradingProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {performance.spotTradingProfit >= 0 ? '+' : ''}{formatPnL(performance.spotTradingProfit)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-white">
                      <span className={performance.totalPnl >= 0 ? "text-green-400" : "text-red-400"}>
                        {performance.totalPnl >= 0 ? '+' : ''}{formatPnL(performance.totalPnl)}%
                      </span>
                    </div>
                    <div
                      className={`flex items-center font-medium justify-end text-sm ${performance.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {performance.totalPnl >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {performance.totalPnl >= 0 ? "Total Profit" : "Total Loss"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-slide {
          width: auto;
        }
        .swiper-wrapper {
          will-change: transform;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          transition-timing-function: linear !important;
        }
      `}</style>
    </div>
  )
}