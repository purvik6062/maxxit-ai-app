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

interface Influencer {
  name: string
  handle: string
  avatar: string
}

interface Tweet {
  id: string
  influencer: Influencer
  coin: string
  tokenId: string
  positive: boolean
  pnl: number
  timestamp: string
}

export default function CarouselHorizontal() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef<any>(null) // Reference to Swiper instance

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const cachedData = localStorage.getItem('cryptoTweetsCarousel')
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData)
          const now = new Date().getTime()
          const cacheTime = new Date(timestamp).getTime()
          const daysDiff = (now - cacheTime) / (1000 * 60 * 60 * 24)
          
          if (daysDiff < 7) {
            setTweets(data)
            setLoading(false)
            return
          } else {
            localStorage.removeItem('cryptoTweetsCarousel')
          }
        }

        const response = await fetch('/api/top-crypto-tweets')
        if (!response.ok) {
          throw new Error('Failed to fetch tweets')
        }
        const data = await response.json()
        
        localStorage.setItem('cryptoTweetsCarousel', JSON.stringify({
          data: data.tweets,
          timestamp: new Date().toISOString()
        }))
        
        setTweets(data.tweets)
      } catch (error) {
        console.error('Error fetching tweets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
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

  const duplicatedTweets = [...tweets, ...tweets, ...tweets]

  const formatPnL = (pnl: number) => {
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

  if (tweets.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-[#020617] py-8">
        <div className="container mx-auto px-4 mb-6 flex justify-center">
          <div className="text-white/60 text-lg">No tweets available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden bg-[#020617] py-8 mt-[3rem]">
      <div className="container mx-auto px-4 mb-6 flex flex-col gap-[0.5rem] items-center justify-center text-center md:text-left">
        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Top Weekly Signal Providers
        </h2>
        <p className="text-white/60 text-base md:text-lg mt-[4px]">Latest insights from leading crypto influencers</p>
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
        {duplicatedTweets.map((tweet, index) => (
          <SwiperSlide
            key={`${tweet.id}-${index}`}
            className="!w-[280px] sm:!w-[320px] md:!w-[380px]"
          >
            <div className="flex-shrink-0 w-full bg-gradient-to-br from-[#0a101f] to-[#020617] rounded-xl border border-[#1a2035] shadow-lg overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-[#1a2035]">
                    <Image
                      src={tweet.influencer.avatar || "/placeholder.svg"}
                      alt={tweet.influencer.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium truncate max-w-[180px]">{tweet.influencer.name}</p>
                    <p className="text-white/60 text-sm truncate max-w-[180px]">@{tweet.influencer.handle}</p>
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
                        <span className="text-purple-400 font-medium">Coin: </span>
                        <span className="text-white/80">{tweet.coin}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-cyan-300/80 font-medium">Token ID: </span>
                        <span className="text-white/70">{tweet.tokenId}</span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        <span className="text-orange-300/80 font-medium">Signal Date: </span>
                        <span className="bg-[#1a2035] px-2 py-1 rounded-full">{formatDate(tweet.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-white">
                      <span className="text-green-400">{formatPnL(tweet.pnl)}%</span>
                    </div>
                    <div
                      className={`flex items-center font-medium justify-end text-sm ${tweet.positive ? "text-green-400" : "text-red-400"}`}
                    >
                      {tweet.positive ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {tweet.positive ? "Profit" : "Loss"}
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