"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Twitter, Repeat2, Gift } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export default function RedeemCreditsPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Follow us on X",
      description:
        "Follow our X account to stay updated with the latest features and updates",
      credits: 100,
      frequency: "monthly",
      icon: FaXTwitter,
      action: "https://x.com/your-account", 
    },
    {
      id: 2,
      title: "Retweet Weekly Top Performers",
      description:
        "Retweet our weekly top performers cluster to help spread the word",
      credits: 100,
      frequency: "monthly",
      icon: Repeat2,
      action: "https://x.com/your-account/tweet-id",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
            <Gift className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Earn Free Credits Monthly
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Complete these simple tasks to earn free credits every month. It's
            our way of saying thank you for supporting our community!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {task.title}
                    </h3>
                    <p className="text-blue-100 mb-4">{task.description}</p>

                    <div className="flex items-center space-x-2 text-blue-400">
                      <span className="text-2xl font-bold">{task.credits}</span>
                      <span className="text-sm">credits</span>
                      <span className="text-blue-300">/ {task.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={task.action}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            How it works
          </h3>
          <div className="space-y-4 text-blue-100">
            <p>
              • Complete the tasks above to start earning free credits every
              month
            </p>
            <p>
              • Credits are automatically added to your account every month
            </p>
            <p>• You can track your credits in your account dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
