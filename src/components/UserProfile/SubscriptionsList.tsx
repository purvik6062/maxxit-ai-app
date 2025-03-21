import React from "react";
import { Calendar, TrendingUp, Users, BarChart2 } from "lucide-react";
import type { Subscription } from "./types";
import { FaXTwitter } from "react-icons/fa6";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const totalLeads = subscriptions.reduce(
    (acc, sub) => acc + (sub.leadsCount || 0),
    0
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-100">
            Subscribed Accounts
          </h3>
          <p className="text-gray-400">Manage your active subscriptions</p>
        </div>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900/50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Subscriptions</p>
              <p className="text-xl font-bold text-gray-100">
                {subscriptions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900/50 p-3 rounded-xl">
              <BarChart2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Leads</p>
              <p className="text-xl font-bold text-gray-100">{totalLeads}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subscriptions.map((sub) => (
          <div
            key={sub.twitterHandle}
            className="bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-900/50 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-100">
                    {sub.twitterHandle}
                  </h4>
                  <div className="flex items-center text-gray-400">
                    <FaXTwitter className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      @{sub.twitterHandle}
                    </span>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-900/50 text-emerald-400">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Expires</span>
              </div>
              <span className="text-sm font-semibold text-gray-100">
                {new Date(sub.expiryDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex items-center text-gray-400">
                <BarChart2 className="w-4 h-4 mr-2" />
                <span className="text-sm">Leads</span>
              </div>
              <span className="text-sm font-semibold text-gray-100">
                {sub.leadsCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
