"use client";
import React, { useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { SubscriptionsList } from "./SubscriptionsList";
import type { UserProfile as UserProfileType } from "./types";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

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

  useEffect(() => {
    if (!isConnected) return; // Prevent unnecessary API calls

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/get-user-profile?walletAddress=${address}`
        );
        const result = await response.json();

        if (result.success) {
          const userData = result.data;
          setProfile({
            ...userData,
            subscribedAccounts: userData.subscribedAccounts.map((sub: any) => ({
              ...sub,
              subscriptionDate: new Date(sub.subscriptionDate),
              expiryDate: new Date(sub.expiryDate),
            })),
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
          });
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [address, isConnected]);

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
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-[8rem] profileCss">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Your Dashboard</h1>
        </div>

        <ProfileHeader profile={profile} />
        <SubscriptionsList subscriptions={profile.subscribedAccounts} />
        {/* <TwitterIntegration
          onAddTwitterAccount={(handle: string) =>
            console.log("Added Twitter account:", handle)
          }
        /> */}
      </div>
    </div>
  );
};

export default UserProfile;
