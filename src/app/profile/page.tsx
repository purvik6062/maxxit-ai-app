"use client";
import { Footer, Header, UserProfile } from "@/components";
import { useState } from "react";

export default function page() {
  const [searchText, setSearchText] = useState("");
  return (
    <>
      <Header searchText={searchText} setSearchText={setSearchText} />
      <UserProfile />
      <Footer />
    </>
  );
}
