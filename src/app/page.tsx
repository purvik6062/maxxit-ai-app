"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";

//INTERNAL IMPORT
import {
  Header,
  Footer,
  Search,
  MovingSubmenu,
  Preloader,
  SideBar,
  Home,
  ImpactLeaderboard,
  HeartbeatDashboard,
  Networks,
  MindMap,
  AddNetwork,
  Price,
  Login,
  Signup,
  Profile,
  Setting,
  AddTokenPair,
  Trading,
  Loader,
} from "../components/index";

interface NetworkData {
  networkName: string;
  praviteKey: string;
  [key: string]: any;
}

const HomePage: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>("Home");
  const [membershipType, setMembershipType] = useState<string>("Premium");
  const [authBackEndID, setAuthBackEndID] = useState<string>("");
  const [networks, setNetworks] = useState<NetworkData | null>(null);
  const [networkName, setNetworkName] = useState<string>("");

  //NOTIFICATION
  const notifyError = (msg: string) => toast.error(msg, { duration: 2000 });
  const notifySuccess = (msg: string) => toast.success(msg, { duration: 2000 });

  useEffect(() => {
    const userBackEndID = localStorage.getItem("CryptoBot_BackEnd");
    const auth = localStorage.getItem("CryptoAUT_TOKEN");
    const network = localStorage.getItem("activeNetwork");
    const parsedNetwork: NetworkData | null = network
      ? JSON.parse(network)
      : null;

    setNetworks(parsedNetwork);
    setNetworkName(parsedNetwork?.networkName || "");

    if (!auth || !userBackEndID) {
      setActiveComponent("Home");
    } else {
      setActiveComponent("Home");
      setAuthBackEndID(userBackEndID);
    }
  }, []);

  return (
    <div>
      <MovingSubmenu />
      <Preloader />
      {activeComponent === "Signup" ? (
        <Signup
          axios={axios}
          setActiveComponent={setActiveComponent}
          notifyError={notifyError}
          notifySuccess={notifySuccess}
        />
      ) : (
        <div className="techwave_fn_wrapper">
          <div className="techwave_fn_wrap">
            <Search />
            <Header
              networkName={networkName}
              setActiveComponent={setActiveComponent}
            />
            <SideBar setActiveComponent={setActiveComponent} />
            {activeComponent === "Home" ? (
              <Home />
            ) : activeComponent === "Impact Leaderboard" ? (
              <ImpactLeaderboard />
            ) : activeComponent === "Heartbeat Dashboard" ? (
              <HeartbeatDashboard />
            ) : activeComponent === "Networks" ? (
              <Networks
                networkName={networkName}
                setNetworkName={setNetworkName}
                notifyError={notifyError}
                notifySuccess={notifySuccess}
              />
            ) : activeComponent === "MindMap" ? (
              <MindMap />
            ) : activeComponent === "Add Network" ? (
              <AddNetwork axios={axios} />
            ) : activeComponent === "Profile" ? (
              <Profile
                setActiveComponent={setActiveComponent}
                notifyError={notifyError}
                notifySuccess={notifySuccess}
              />
            ) : activeComponent === "Setting" ? (
              <Setting
                notifyError={notifyError}
                notifySuccess={notifySuccess}
                axios={axios}
              />
            ) : activeComponent === "Add Token Pair" ? (
              <AddTokenPair />
            ) : null}
          </div>
        </div>
      )}

      {activeComponent === "Login" && (
        <Login
          setActiveComponent={setActiveComponent}
          axios={axios}
          notifyError={notifyError}
          notifySuccess={notifySuccess}
        />
      )}
    </div>
  );
};

export default HomePage;
