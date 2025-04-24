import React from "react";
import { Calendar, TrendingUp, BarChart2, Users } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import type { Subscription } from "./types";
import { useRouter } from "next/navigation";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const router = useRouter();
  const totalLeads = subscriptions.reduce(
    (acc, sub) => acc + (sub.leadsCount || 0),
    0
  );

  const headerStyle: React.CSSProperties = {
    border: '1px solid rgba(206, 212, 218, 0.15)',
    borderRadius: '0.375rem',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  };

  const iconContainerStyle: React.CSSProperties = {
    backgroundColor: '#1a1f29',
    border: '1px solid rgba(206, 212, 218, 0.15)',
    borderRadius: '0.375rem',
    padding: '0.5rem'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#E4EFFF',
    border: '1px solid rgba(206, 212, 218, 0.5)',
    borderRadius: '0.375rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const cardIconStyle: React.CSSProperties = {
    backgroundColor: '#1a1f29',
    border: '1px solid rgba(206, 212, 218, 0.15)',
    borderRadius: '0.375rem',
    padding: '0.5rem'
  };

  const activeTagStyle: React.CSSProperties = {
    backgroundColor: '#1BDC14',
    color: '#393B49',
    borderRadius: '9999px',
    padding: '0.125rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500
  };

  const handleCardClick = (twitterHandle: string) => {
    router.push(`/influencer/${twitterHandle}`);
  };

  return (
    <div className="font-leagueSpartan">
      <div style={headerStyle} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 bg-[#1C2333]">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-[#AAC9FA] font-leagueSpartan">
            Subscribe Accounts
          </h3>
          <p className="text-[#8ba1bc] mt-1">Manage your active subscriptions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
          <div className="flex items-center space-x-3">
            <div style={iconContainerStyle}>
              <Users className="w-5 h-5 text-[#8ba1bc]" />
            </div>
            <div>
              <p className="text-sm text-[#818791]">Active subscriptions</p>
              <p className="text-xl font-semibold text-[#AAC9FA]">{subscriptions.length || 7}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div style={iconContainerStyle}>
              <BarChart2 className="w-5 h-5 text-[#8ba1bc]" />
            </div>
            <div>
              <p className="text-sm text-[#818791]">Total Leads</p>
              <p className="text-xl font-semibold text-[#AAC9FA]">{totalLeads || 274}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0E1725] rounded-xl" style={{ border: "1px solid #818791" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:p-6">
          {(subscriptions.length ? subscriptions : Array(4).fill(null)).map((sub, index) => (
            <div
              key={sub?.twitterHandle || `placeholder-${index}`}
              style={cardStyle}
              className="flex flex-col cursor-pointer hover:transform hover:scale-101 transition-transform duration-200 ease-in-out"
              onClick={() => handleCardClick(sub?.twitterHandle)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <div style={cardIconStyle}>
                    <TrendingUp className="w-5 h-5 text-[#8ba1bc]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#111827] font-leagueSpartan">
                      {sub?.twitterHandle || ""}
                    </h4>
                    <div className="flex items-center text-[#4b5563]">
                      <FaXTwitter className="w-3.5 h-3.5 mr-1" />
                      <span className="text-sm">
                        @{sub?.twitterHandle || "Lorem ipsum"}
                      </span>
                    </div>
                  </div>
                </div>
                <span style={activeTagStyle} className="inline-flex items-center self-start">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center text-[#4b5563]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Expires</span>
                </div>
                <span className="text-sm font-medium text-[#111827]">
                  {sub?.expiryDate ?
                    new Date(sub.expiryDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) :
                    "Apr 23, 2025"
                  }
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-[#4b5563]">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  <span className="text-sm">Leads</span>
                </div>
                <span className="text-sm font-medium text-[#111827]">
                  {sub?.leadsCount || 48}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}