"use client";
import React, { useState, useEffect } from "react";
//INTERNAL IMPORT
import { Footer } from "../index";
import PredictionDashboard from "../Global/Landing";

const MindMap = () => {
  return (
    <>
      <div className="techwave_fn_content">
        <div className="techwave_fn_page">
          <div className="techwave_fn_models_page">
            <div className="container">
              <div className="models__content">
                <div className="models__results">
                  <div className="fn__tabs_content">
                    <div className="tab__item active" id="tab1">
                      <div className="tailwind-scope"></div>
                      <PredictionDashboard />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MindMap;
