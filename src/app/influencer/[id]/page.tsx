"use client";
import React from "react";
import SignalStats from "@/components/InfluencerProfile/SignalStats";
import InfluencerMetrics from "@/components/InfluencerProfile/InfluencerMetrics";
import { useParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Page() {
  const { id } = useParams<any>();

  return (
    <div className="py-4 px-5">
      <ToastContainer />
      <InfluencerMetrics influencerId={id} />
      <SignalStats influencerId={id} />
    </div>
  );
}

export default Page;
