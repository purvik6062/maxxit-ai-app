"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Twitter, Repeat2, Gift } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

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
    <div className="font-leagueSpartan min-h-screen bg-[#0e111a] bg-opacity-90 py-12 px-4 ">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-napzerRounded bg-gradient-to-b from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent">
            Earn Free Credits Monthly
          </h1>
          <p className="text-white text-base max-w-2xl mx-auto">
            Complete these simple tasks to earn free credits every month. It's
            our way of saying thank you for supporting our community!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className="bg-[#E4EFFF] backdrop-blur-sm rounded-2xl p-6 border border-gray-100/20"
              >
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-14 h-14 rounded-full bg-[#162037] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#070915] mb-1 font-leagueSpartan">
                      {task.title}
                    </h3>
                    <p className="text-[#070915] text-sm">
                      {task.description}
                    </p>

                    <div className="py-4">
                      <span className="text-3xl font-bold bg-gradient-to-b from-[#1C2333] to-[#1A4281] bg-clip-text text-transparent">{task.credits}</span>
                      <span className="text-sm text-[#070915] ml-1">credits/ {task.frequency}</span>
                    </div>
                    <Link
                      href={task.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-2 bg-[#070915] text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#0E1725] bg-opacity-30 backdrop-blur-sm rounded-2xl p-8" style={{ border: "1px solid #818791" }}>
          <h3 className="text-xl font-semibold text-white mb-4 font-leagueSpartan">
            How it works
          </h3>
          <div className="space-y-4 text-white">
            <p>
              • Complete the tasks above to start earning free credits every month
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
