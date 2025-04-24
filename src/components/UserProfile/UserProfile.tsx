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
import UserSignals from "./UserSignals";

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
  const [activeSection, setActiveSection] = useState<
    "subscriptions" | "api" | "signals"
  >("subscriptions");
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
    <div className="min-h-screen pb-[4rem]">
      <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent font-napzerRounded">
            Your Dashboard
          </h1>
        </div>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 font-leagueSpartan ">
          {/* Profile Header - full width on mobile, sidebar on larger screens */}
          <div className="col-span-1 md:col-span-1">
            <ProfileHeader profile={profile} />
          </div>

          {/* Main content area */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            {/* Toggle Buttons */}
            <div className="mb-6">
              <div
                className="bg-[#0D1321] rounded-full p-1"
                style={{ border: "1px solid #353940" }}
              >
                <div className="grid grid-cols-3 w-full">
                  <button
                    onClick={() => setActiveSection("subscriptions")}
                    className={`px-2 py-2.5 text-center text-sm md:text-base rounded-full transition-all ${
                      activeSection === "subscriptions"
                        ? "bg-[#1a2234] text-white font-medium shadow-inner"
                        : "text-[#8ba1bc] hover:text-white"
                    }`}
                  >
                    Subscriptions
                  </button>
                  <button
                    onClick={() => setActiveSection("signals")}
                    className={`px-2 py-2.5 text-center text-sm md:text-base rounded-full transition-all mx-1 ${
                      activeSection === "signals"
                        ? "bg-[#1a2234] text-white font-medium shadow-inner"
                        : "text-[#8ba1bc] hover:text-white"
                    }`}
                  >
                    Signals
                  </button>
                  <button
                    onClick={() => setActiveSection("api")}
                    className={`px-2 py-2.5 text-center text-sm md:text-base rounded-full transition-all ${
                      activeSection === "api"
                        ? "bg-[#1a2234] text-white font-medium shadow-inner"
                        : "text-[#8ba1bc] hover:text-white"
                    }`}
                  >
                    API Access
                  </button>
                </div>
              </div>
            </div>

            {/* Conditionally Render Sections */}
            {activeSection === "subscriptions" && (
              <SubscriptionsList subscriptions={profile.subscribedAccounts} />
            )}
            {activeSection === "signals" && (
              <UserSignals twitterId={session.user.id} profile={profile} />
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
