import React, { useState, useEffect } from "react";
import FlipkartSidebar from "./FlipkartSidebar";
import Sellerlist from "../Common/Sellerlist"; // <-- Changed to Common
import "./FlipkartDashboard.css";

const FlipkartDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flipkart-dashboard-layout">
        <FlipkartSidebar />
        <div className="flipkart-main-content">
          <div className="flipkart-loading">
            <div className="fk-spinner"></div>
            <p>Loading Flipkart Sellers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flipkart-dashboard-layout">
      <FlipkartSidebar />
      <div className="flipkart-main-content">
        {/* Now using Common Sellerlist */}
        <Sellerlist marketplace="flipkart" />
      </div>
    </div>
  );
};

export default FlipkartDashboard;