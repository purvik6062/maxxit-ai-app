"use client";
import React from "react";
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
                      <a>
                        <span className="icon">
                          <img
                            src="img/lighticon/light-19.png"
                            className="fn__svg"
                            alt=""
                          />
                        </span>
                        <h2 className="title">Buy Any Token</h2>
                        <p className="desc">
                          Lorem ipsum, dolor sit amet consectetur adipisicing
                          elit. Error quibusdam amet a harum quaerat facere
                          vitae id odio sed facilis quas atque aut.
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
                      <a>
                        <span className="icon">
                          <img
                            src="img/lighticon/light-16.png"
                            className="fn__svg"
                            alt=""
                          />
                        </span>
                        <h2 className="title">Sell Any Token</h2>
                        <p className="desc">
                          Lorem ipsum, dolor sit amet consectetur adipisicing
                          elit. Error quibusdam amet a harum quaerat facere
                          vitae id odio sed facilis quas atque aut.
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
                {/* <img src="img/light-logo.png" alt="" /> */}
                <h1 className="mt-1 mainHead">TradingMinds</h1>
                <p className="fn__animated_text">
                  Trading Minds is an AI-powered platform designed to evaluate the credibility and accuracy of trading-related Twitter accounts, helping enthusiasts make informed decisions. It dynamically ranks accounts on a leaderboard based on prediction accuracy, engagement, and activity. Users can subscribe to high-performing accounts and automate trading decisions through AI-driven execution.
                </p>
                <hr />
                <div className="fn__members">
                  <div className="active item">
                    <span className="circle"></span>
                    <span className="text">1111111 Online</span>
                  </div>
                  <div className="item">
                    <span className="circle"></span>
                    <span className="text">23645833 Members</span>
                  </div>
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

export default Home;
