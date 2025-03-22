"use client";
import React, { useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { SubscriptionsList } from "./SubscriptionsList";
import type { UserProfile as UserProfileType } from "./types";
import { Loader2, Eye, EyeOff, Copy, Key } from "lucide-react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import ApiCredentialsSection from "./ApiCredentialSection";

// Reusable UI components for different states
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-300">Loading profile...</p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <div className="bg-red-900/50 text-red-100 p-6 rounded-lg max-w-md text-center">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <p>{message}</p>
    </div>
  </div>
);

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <div className="bg-blue-900/50 text-yellow-100 p-6 rounded-lg max-w-md text-center">
      <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
      <p>{message}</p>
    </div>
  </div>
);

const UserProfile = () => {
  const { address, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  // New state for toggling sections
  const [activeSection, setActiveSection] = useState<"subscriptions" | "api">(
    "subscriptions"
  );

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await fetch(
          `/api/get-user-profile?walletAddress=${address}`
        );
        const profileResult = await profileResponse.json();

        if (!profileResult.success) {
          throw new Error("Failed to fetch user profile");
        }

        // Fetch API key separately
        const apiKeyResponse = await fetch(
          `/api/get-api-key?walletAddress=${address}`
        );
        const apiKeyResult = await apiKeyResponse.json();

        setProfile({
          ...profileResult.data,
          subscribedAccounts: profileResult.data.subscribedAccounts.map(
            (sub: any) => ({
              ...sub,
              subscriptionDate: new Date(sub.subscriptionDate),
              expiryDate: new Date(sub.expiryDate),
            })
          ),
          createdAt: new Date(profileResult.data.createdAt),
          updatedAt: new Date(profileResult.data.updatedAt),
        });

        setApiKey(apiKeyResult.success ? apiKeyResult.apiKey : null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, isConnected]);

  const handleNewKeyGenerated = (newKey: string) => {
    setApiKey(newKey);
  };

  // Early returns for different states
  if (!isConnected)
    return (
      <EmptyState
        title="Wallet Not Connected"
        message="Please connect your wallet to view your profile."
      />
    );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!profile)
    return (
      <EmptyState
        title="No Profile Found"
        message="Could not find a profile for the provided wallet address."
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-5xl mt-[6.3rem] mx-auto py-12 px-4 sm:px-6 lg:px-8 profileCss">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Your Dashboard</h1>
        </div>

        <ProfileHeader profile={profile} />

        {/* Toggle Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveSection("subscriptions")}
            className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
              activeSection === "subscriptions"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Subscribed Accounts
          </button>
          <button
            onClick={() => setActiveSection("api")}
            className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
              activeSection === "api"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            API Access
          </button>
        </div>

        {/* Conditionally Render Sections */}
        {activeSection === "subscriptions" && (
          <SubscriptionsList subscriptions={profile.subscribedAccounts} />
        )}
        {activeSection === "api" && (
          <ApiCredentialsSection
            apiKey={apiKey}
            endpoint={
              process.env.NODE_ENV === "production"
                ? "https://app.ctxbt.com"
                : "https://app.ctxbt.com"
            }
            walletAddress={address!}
            onGenerateNewKey={handleNewKeyGenerated}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
