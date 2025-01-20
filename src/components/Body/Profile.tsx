"use client";
import React, { useState, useEffect } from "react";

//INTERNAL IMPORT
import { shortenAddress } from "../../utils/index";
import { Footer } from "../index";

const Profile = ({ setActiveComponent, notifyError, notifySuccess }: any) => {
  const [userDetails, setUserDetails] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userProfile") || "{}");
    setUserDetails(user);
  }, []);

  return (
    <div className="techwave_fn_content bg-gradient-to-b from-[#020617] to-[#0f172a]">
      <div className="techwave_fn_page">
        <div className="techwave_fn_user_profile_page">
          <div className="techwave_fn_pagetitle">
            <h2 className="title">User Profile</h2>
          </div>

          <div className="container small">
            <div className="techwave_fn_user_profile">
              <div className="user__profile bg-gradient-to-b from-[#020617] to-[#0f172a]">
                <div className="user_avatar">
                  <img src={userDetails?.image || "img/crypto.png"} alt="" />
                </div>

                <div className="user_details bg-gradient-to-b from-[#020617] to-[#0f172a]">
                  <ul>
                    <li>
                      <div className="item">
                        <h4 className="subtitle">Name</h4>
                        <h3 className="title">
                          {userDetails?.name || "Update"}
                        </h3>
                      </div>
                    </li>
                    <li>
                      <div className="item">
                        <h4 className="subtitle">Username</h4>
                        <h3 className="title">
                          {userDetails?.userName || "Update"}
                        </h3>
                      </div>
                    </li>
                    <li>
                      <div className="item">
                        <h4 className="subtitle">Address</h4>
                        <h3 className="title">
                          {shortenAddress(userDetails?.walletAddress) ||
                            "Update"}
                        </h3>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="user__plan bg-gradient-to-b from-[#0b0e1d] to-[#0c2153]">
                <div className="plan_left">
                  <h4 className="subtitle">Your Key</h4>
                  <p className="info">
                    <span>PrivateKey</span>
                    {""}
                    {shortenAddress(userDetails?.praviteKey) || "update"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
