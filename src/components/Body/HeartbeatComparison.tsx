import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Agent {
  id: number
  name: string
  handle: string
  heartbeat: number
}

interface HeartbeatComparisonProps {
  agents: Agent[]
}

export const HeartbeatComparison: React.FC<HeartbeatComparisonProps> = ({ agents }) => {
  const avgHeartbeat = agents.reduce((acc, curr) => acc + curr.heartbeat, 0) / agents.length

  const data = agents.map((agent) => ({
    name: agent.name,
    heartbeat: agent.heartbeat,
    average: avgHeartbeat,
  }))

  return (
    <div className="w-full bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
      <h2 className="text-2xl font-bold text-white mb-4">Heartbeat vs Average</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="heartbeat" fill="#3B82F6" name="Heartbeat" />
          <Bar dataKey="average" fill="#6B7280" name="Average" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

