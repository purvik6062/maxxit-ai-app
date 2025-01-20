"use client";
import React, { useContext, useEffect, useState } from "react";
import { FaRegCopy } from "react-icons/fa6";

//INTERNAL IMPORT
import { Footer } from "../index";
import { CONTEXT } from "../../context/context";
const HeartbeatDashboard = () => {

  //STATE VARIABLE
  const [search, setSearch] = useState("");
  const [searchItem, setSearchItem] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchItem), 1000);
    return () => clearTimeout(timer);
  }, [searchItem]);

  return (
    <div className="techwave_fn_content">
     heartbeat dashboard
      <Footer />
    </div>
  );
};

export default HeartbeatDashboard;
