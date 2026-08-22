import React, { useState } from "react";

// Subfolder imports (relative to src/components/Amazon/)
import Inventory from "./Pricing APIs/Inventory";

const AmazonDashboard = () => {
  const [activeTab, setActiveTab] = useState("amazon-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState({
    dashboards: true,
    analytics: true,
    auth: false,
    seller: false,
    product: false,
    listings: false,
    orders: false,
    finances: false,
    notifications: false,
    shipping: false,
    messaging: false,
    feeds: false,
  });

  return (
    <div className="amazon-dashboard-container" style={{ padding: "24px" }}>
      <h1>Amazon Dashboard</h1>
      <p>Manage your Amazon SP-API integrations, listings, and analytics.</p>

      {/* Render tab content dynamically */}
      {activeTab === "inventory" && <Inventory />}
    </div>
  );
};

export default AmazonDashboard;