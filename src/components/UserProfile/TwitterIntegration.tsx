import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

interface TwitterIntegrationProps {
  onAddTwitterAccount: (handle: string) => void;
}

export function TwitterIntegration({
  onAddTwitterAccount,
}: TwitterIntegrationProps) {
  const [twitterHandle, setTwitterHandle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twitterHandle.trim()) {
      onAddTwitterAccount(twitterHandle.trim());
      setTwitterHandle("");
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-100">
            Add Twitter Account
          </h3>
          <p className="text-gray-400">Follow your favorite influencers</p>
        </div>
        <div className="bg-indigo-900/50 p-3 rounded-xl">
          <FaXTwitter className="w-6 h-6 text-indigo-400" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="Enter Twitter handle (e.g. @example)"
              className="block w-full pl-11 pr-4 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-900/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow duration-200"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </form>
    </div>
  );
}
