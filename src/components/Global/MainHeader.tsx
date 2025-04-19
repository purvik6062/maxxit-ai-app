"use client";
import React, { useState } from "react";
import Header from "./Header";

function MainHeader() {
  const [searchText, setSearchText] = useState("");
  return <Header searchText={searchText} setSearchText={setSearchText} />;
}

export default MainHeader;
