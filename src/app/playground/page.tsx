"use client";
import { Footer, Header } from "@/components";
import MessagePlayground from "@/components/Playground/MessagePlayground";
import React, { useState } from "react";

function page() {
  const [searchText, setSearchText] = useState("");
  return (
    <div>
      <Header searchText={searchText} setSearchText={setSearchText} />
      <MessagePlayground />
      <Footer />
    </div>
  );
}

export default page;
