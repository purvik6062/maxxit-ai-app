"use client";
import React, { useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { SubscriptionsList } from "./SubscriptionsList";
import type { UserProfile as UserProfileType } from "./types";
import { Loader2, Eye, EyeOff, Copy, Key, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ApiCredentialsSection from "./ApiCredentialSection";
import { useCredits } from "@/context/CreditsContext";
import UserSignals from "./UserSignals";
import Link from "next/link";

// Reusable UI components for different states
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-300">Loading profile...</p>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-red-900 text-red-100 p-6 rounded-lg max-w-md text-center">
      <h2 className="text-xl font-bold mb-2">Error</h2>
      <p>{message}</p>
    </div>
  </div>
);

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-blue-900/50 text-yellow-100 p-6 rounded-lg max-w-md text-center">
      <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
      <p>{message}</p>
    </div>
  </div>
);

const UserProfile = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "subscriptions" | "api" | "signals"
  >("subscriptions");
  const { credits, updateCredits } = useCredits();
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  console.log("session", session);
  console.log("sessionStatus", sessionStatus);

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
    // Only proceed when session status is no longer loading
    if (sessionStatus === "loading") {
      return;
    }

    // Check if user is authenticated after session has loaded
    if (!session?.user?.id) {
      setError("Please connect with your X account to view your profile.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileResponse = await fetch(
          `/api/get-user-profile?twitterId=${session.user.id}`
        );
        const profileResult = await profileResponse.json();

        if (!profileResult.success) {
          if (profileResult.error?.message === "User not found") {
            // User is logged in with Twitter but hasn't completed Telegram registration
            setShowRegistrationPrompt(true);
            setLoading(false);
            return;
          }
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
        setShowRegistrationPrompt(false);
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
  }, [session?.user?.id, credits, sessionStatus]);

  // Early returns for different states
  if (sessionStatus === "loading") return <LoadingState />;
  if (!session?.user?.id && sessionStatus === "unauthenticated")
    return (
      <EmptyState
        title="Not Logged In"
        message="Please login to view your profile."
      />
    );
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (showRegistrationPrompt) {
    return (
      <div className="min-h-screen pt-12 pb-16 px-4">
        <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-900 to-[#070915] rounded-xl p-6 shadow-xl border border-blue-500/30">
          <div className="text-center mb-6">
            <div className="bg-blue-500/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Registration Incomplete
            </h1>
            <p className="text-gray-300">
              You need to complete your registration to access your profile.
            </p>
          </div>

          <div className="bg-[#111528] rounded-lg p-4 my-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Registration Steps
            </h3>

            <div className="flex items-start space-x-3 mb-5">
              <div className="flex-shrink-0 bg-green-500/20 rounded-full p-1.5 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">
                  Step 1: Twitter/X Login
                </p>
                <p className="text-sm text-gray-400">Successfully completed</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 bg-amber-500/20 rounded-full p-1.5 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-400"
                >
                  <path d="M12 9v4" />
                  <path d="M12 16h.01" />
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">
                  Step 2: Connect Telegram
                </p>
                <p className="text-sm text-gray-400">
                  Required to activate your account
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/"
              className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
            >
              Back to Home
            </Link>
            <button
              onClick={() => {
                // Direct user to the header's registration flow by showing a toast
                toast.custom(
                  (t) => (
                    <div
                      className={`px-6 py-4 bg-gray-800 rounded-lg shadow-lg border border-blue-500/30 ${
                        t.visible ? "animate-enter" : "animate-leave"
                      }`}
                    >
                      <p className="text-white mb-2">
                        Click on "Complete Setup" in the top bar to continue
                        registration.
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm"
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  ),
                  {
                    duration: 10000,
                    position: "top-center",
                  }
                );
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg font-medium"
            >
              Complete Registration
            </button>
          </div>
        </div>
      </div>
    );
  }
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#AAC9FA] to-[#E1EAF9] bg-clip-text text-transparent font-napzerRounded">
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
