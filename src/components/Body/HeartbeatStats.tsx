import type React from "react"

interface Agent {
  id: number
  name: string
  handle: string
  heartbeat: number
}

interface HeartbeatStatsProps {
  agents: Agent[]
}

export const HeartbeatStats: React.FC<HeartbeatStatsProps> = ({ agents }) => {
  const avgHeartbeat = agents.reduce((acc, curr) => acc + curr.heartbeat, 0) / agents.length
  const maxHeartbeat = Math.max(...agents.map((agent) => agent.heartbeat))
  const minHeartbeat = Math.min(...agents.map((agent) => agent.heartbeat))

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
        <h3 className="text-gray-400 text-sm">Average Heartbeat</h3>
        <p className="text-2xl font-bold text-white">{avgHeartbeat.toFixed(1)}</p>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
        <h3 className="text-gray-400 text-sm">Highest Heartbeat</h3>
        <p className="text-2xl font-bold text-white">{maxHeartbeat}</p>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
        <h3 className="text-gray-400 text-sm">Lowest Heartbeat</h3>
        <p className="text-2xl font-bold text-white">{minHeartbeat}</p>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-lg backdrop-blur-sm border border-blue-500/20">
        <h3 className="text-gray-400 text-sm">Total Agents</h3>
        <p className="text-2xl font-bold text-white">{agents.length}</p>
      </div>
    </div>
  )
}

