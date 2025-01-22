import type React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Agent {
  id: number
  name: string
  handle: string
  heartbeat: number
}

interface HeartbeatTrendProps {
  agents: Agent[]
}

export const HeartbeatTrend: React.FC<HeartbeatTrendProps> = ({ agents }) => {
  // Sort agents by heartbeat to create a trend
  const sortedData = [...agents]
    .sort((a, b) => b.heartbeat - a.heartbeat)
    .map((agent) => ({
      name: agent.name,
      heartbeat: agent.heartbeat,
    }))

  return (
    <div className="w-full bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
      <h2 className="text-2xl font-bold text-white mb-4">Heartbeat Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "0.5rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="heartbeat"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: "#3B82F6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

