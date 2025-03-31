"use client";
import { Footer, Header } from "@/components";
import PricingSection from "@/components/Pricing/PricingSection";
import React, { useState } from "react";

function page() {
  const [searchText, setSearchText] = useState("");
  return (
    <div>
      <Header searchText={searchText} setSearchText={setSearchText} />
      <PricingSection />
      <Footer />
    </div>
  );
}

export default page;
