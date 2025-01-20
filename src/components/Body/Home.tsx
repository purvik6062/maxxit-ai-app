"use client";
import React from "react";
import { Users, LineChart } from "lucide-react";
import { Footer } from "../index";

const Home = () => {
  return (
    <div className="techwave_fn_content">
      <div className="techwave_fn_page">
        <div className="techwave_fn_home">
          <div className="section_home">
            <div className="section_left">
              <div className="techwave_fn_title_holder">
                <h1 className="title">Automate Your Crypto Trading</h1>

                <p className="desc">
                  Crypto Trading Financial AI Agent For Buying and Sell Crypto
                </p>
              </div>

              <div className="techwave_fn_interactive_list">
                <ul>
                  <li>
                    <div className="item">
                      <a href="/impact-leaderboard">
                        <span className="icon">
                           <Users className="h-10 w-10" />
                        </span>
                        <h2 className="title">Impact Leaderboard</h2>
                        <p className="desc">
                        Cut through the noise with our Impact Leaderboard. We rank Crypto Twitter accounts based on their prediction accuracy and profitability over 1d, 1w, 1M, and 1y intervals
                        </p>
                        <span className="arrow">
                          <img
                            src="img/lighticon/light-22.png"
                            className="fn__svg"
                            alt=""
                          />
                        </span>
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="item">
                      <a href="/heartbeat-dashboard">
                        <span className="icon">
                           <LineChart className="h-10 w-10" />
                        </span>
                        <h2 className="title">Heartbeat Dashboard</h2>
                        <p className="desc">
                        Stay ahead of the market with real-time insights. Our Heartbeat Leaderboard highlights the most impactful crypto trends by combining influencer predictions and market movements.
                        </p>
                        <span className="arrow">
                          <img
                            src="img/lighticon/light-22.png"
                            className="fn__svg"
                            alt=""
                          />
                        </span>
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="section_right">
              <div className="company_info">
                <h1 className="mt-1 font-bold text-3xl text-balance bg-gradient-to-r from-white to-blue-600 bg-clip-text text-left text-transparent">CTxbt</h1>
                <p className="fn__animated_text text-gray-300">
                  CTxbt is an AI-powered platform designed to evaluate the credibility and accuracy of trading-related Twitter accounts, helping enthusiasts make informed decisions. It dynamically ranks accounts on a leaderboard based on prediction accuracy, engagement, and activity. Users can subscribe to high-performing accounts and automate trading decisions through AI-driven execution.
                </p>
                <hr />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
