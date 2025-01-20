"use client";
import React, { useState, useEffect } from "react";
import { FaRegCopy } from "react-icons/fa";

//INTERNAL IMPORT
import { Footer } from "../index";

const ImpactLeaderboard = () => {
  const [search, setSearch] = useState("");
  const [searchItem, setSearchItem] = useState(search);
  interface Token {
    network: string;
    token1: string;
    token2: string;
    fee: string;
  }

  const [tokens, setTokens] = useState<Token[]>([]);
  const [copyTokens, setCopyTokens] = useState<Token[]>([]);
  const [tradeToken, setTradeToken] = useState<Token | {}>({});
  const [active, setActive] = useState<any>();

  useEffect(() => {
    const tokenLists = JSON.parse(localStorage.getItem("setTokens") || "[]");
    const tokenPair = JSON.parse(localStorage.getItem("tokenPair") || "{}");

    setTradeToken(tokenPair);
    setTokens(tokenLists);
    setCopyTokens(tokenLists);

    console.log(tokenLists);
  }, []);

  const onHandleSearch = (value: any) => {
    const filterTokens = tokens?.filter(({ network }) =>
      network?.toLowerCase().includes(value.toLowerCase())
    );

    if (filterTokens?.length === 0) {
      setTokens(copyTokens);
    } else {
      setTokens(filterTokens);
    }
  };

  const onClearSearch = () => {
    if (tokens?.length && copyTokens?.length) {
      setTokens(copyTokens);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchItem), 1000);
    return () => clearTimeout(timer);
  }, [searchItem]);

  useEffect(() => {
    if (search) {
      onHandleSearch(search);
    } else {
      onClearSearch();
    }
  }, [search]);

  const selectTokenPair = () => {
    localStorage.setItem("tokenPair", JSON.stringify(tradeToken));
  };

  return (
    <div className="techwave_fn_content">
      impact leaderboard
      <Footer />
    </div>
  );
};

export default ImpactLeaderboard;
