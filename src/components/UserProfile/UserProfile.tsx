"use client";
import React, { useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { SubscriptionsList } from "./SubscriptionsList";
import type { UserProfile as UserProfileType } from "./types";
import { Loader2, Eye, EyeOff, Copy, Key } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ApiCredentialsSection from "./ApiCredentialSection";
import { useCredits } from "@/context/CreditsContext";

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
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"subscriptions" | "api" | "signals">(
    "subscriptions"
  );
  const { credits, updateCredits } = useCredits();

  const handleApiKeyUpdate = (newKey: string) => {
    setApiKey(newKey);
  };

  const handleNewKeyGenerated = async (newKey: any) => {
    setApiKey(newKey);
    await updateCredits(); // Refresh credits after generating new key
    if (profile) {
      setProfile({
        ...profile,
        credits: credits !== null ? credits - 50 : profile.credits - 50,
      }); // Update local profile credits
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await fetch(
          `/api/get-user-profile?twitterId=${session.user.id}`
        );
        const profileResult = await profileResponse.json();

        if (!profileResult.success) {
          throw new Error("Failed to fetch user profile");
        }

        // Fetch API key separately
        const apiKeyResponse = await fetch(
          `/api/get-api-key?twitterId=${session.user.id}`
        );
        const apiKeyResult = await apiKeyResponse.json();

        const newProfile = {
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
          credits: credits !== null ? credits : profileResult.data.credits,
        };

        setProfile(newProfile);
        setApiKey(apiKeyResult.success ? apiKeyResult.data.apiKey : null);
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
  }, [session?.user?.id, credits]);

  // Early returns for different states
  if (!session?.user?.id)
    return (
      <EmptyState
        title="Not Logged In"
        message="Please login to view your profile."
      />
    );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!profile)
    return (
      <EmptyState
        title="No Profile Found"
        message="Could not find a profile for the provided Twitter ID."
      />
    );

  return (
    <div className="min-h-screen bg-[#0b1016] py-[4rem]">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Dashboard</h1>
        </div>
        <div className="grid grid-cols-8 gap-10">
          <div className="col-span-2">


            <ProfileHeader profile={profile} />
          </div>

          {/* Toggle Buttons */}
          <div className="col-span-6">
            <div className="flex mb-6 rounded-full bg-[#0D1321] overflow-hidden" style={{ border: "1px solid #353940" }}>
              <div className="flex w-full p-1 rounded-full">
                <button
                  onClick={() => setActiveSection("subscriptions")}
                  className={`flex-1 px-8 py-3 text-center transition-all ${activeSection === "subscriptions"
                    ? "bg-[#DEEBFF14] text-white font-medium rounded-r-sm rounded-l-full shadow-inner shadow-[#E4EFFF47]"
                    : "text-[#8ba1bc] hover:text-white"
                    }`}
                >
                  Subscribed Accounts
                </button>
                <button
                  onClick={() => setActiveSection("signals")}
                  className={`flex-1 px-8 py-3 text-center transition-all ${activeSection === "signals"
                    ? "bg-[#DEEBFF14] text-white font-medium rounded-sm shadow-inner shadow-[#E4EFFF47]"
                    : "text-[#8ba1bc] hover:text-white"
                    }`}
                >
                  Your Signals
                </button>
                <button
                  onClick={() => setActiveSection("api")}
                  className={`flex-1 px-8 py-3 text-center transition-all ${activeSection === "api"
                    ? "bg-[#DEEBFF14] text-white font-medium rounded-l-sm rounded-r-full shadow-inner shadow-[#E4EFFF47]"
                    : "text-[#8ba1bc] hover:text-white"
                    }`}
                >
                  API Access
                </button>
              </div>
            </div>

            {/* Conditionally Render Sections */}
            {activeSection === "subscriptions" && (
              <SubscriptionsList subscriptions={profile.subscribedAccounts} />
            )}
            {activeSection === "signals" && (
              <div className="bg-[#131d2c] rounded-lg p-6">
                <h2 className="text-xl font-medium text-white mb-4">Your Trading Signals</h2>
                <p className="text-[#8ba1bc]">You don't have any signals yet. Subscribe to trading accounts to receive signals.</p>
              </div>
            )}
            {activeSection === "api" && (
              <ApiCredentialsSection
                apiKey={apiKey}
                endpoint={
                  process.env.NODE_ENV === "production"
                    ? "https://app.maxxit.ai"
                    : "https://app.maxxit.ai"
                }
                twitterId={session.user.id}
                onGenerateNewKey={handleNewKeyGenerated}
                onApiKeyUpdate={handleApiKeyUpdate}
                profile={profile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
