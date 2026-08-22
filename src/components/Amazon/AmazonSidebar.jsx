import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AmazonSidebar.css";

const AmazonSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="amazon-sidebar">
      <div className="sidebar-header">
        <h2>Amazon Seller</h2>
      </div>
      <nav className="sidebar-nav">
        <button
          className={location.pathname === "/marketplaces/amazon" ? "active" : ""}
          onClick={() => navigate("/marketplaces/amazon")}
        >
          Dashboard
        </button>
        <button onClick={() => navigate("/marketplaces")}>
          ← Switch Marketplace
        </button>
      </nav>
    </aside>
  );
};

export default AmazonSidebar;