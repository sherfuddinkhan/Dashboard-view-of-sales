import React, { useState, useEffect } from "react";
import FlipkartSidebar from "./FlipkartSidebar";
import FlipkartSellerlist from "./sellers/FlipkartSellerlist";
import "./FlipkartDashboard.css";

const FlipkartDashboard = () => {
  const [loading, setLoading] = useState(true);

  // Loading page effect
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
        {/* Only Sellers - No other things */}
        <FlipkartSellerlist />
      </div>
    </div>
  );
};

export default FlipkartDashboard;