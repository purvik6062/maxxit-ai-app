"use client";
import React from "react";
import SignalStats from "@/components/InfluencerProfile/SignalStats";
// import InfluencerTable from "@/components/InfluencerProfile/InfluencerTable";
import InfluencerMetrics from "@/components/InfluencerProfile/InfluencerMetrics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PageProps {
  params: {
    id: string;
  };
}

function Page({ params }: PageProps) {
  const { id } = params;

  return (
    <div className="py-4 px-5">
      <ToastContainer />
      <InfluencerMetrics influencerId={id} />
      <SignalStats influencerId={id} />
    </div>
  );
}

export default Page;
