import React, { useState } from "react";
import FlipkartSidebar from "./FlipkartSidebar.js";
import Sellerlist from "../Common/Sellerlist.js";
import SellerCustomerlist from "../Common/SellerCustomerlist.js";

// Flipkart APIs - your real files
import ListingsCommonV3Api from "./Catalog APIs/ListingsCommonV3Api.js";
import FlipkartProducts from "./Products/FlipkartProducts.jsx";
import FlipkartInventoryFBF from "./Inventory APIs/FlipkartInventoryFBF.jsx";
import FlipkartPricing from "./Pricing/FlipkartPricing.jsx";
import FlipkartOrders from "./Orders APIs/FlipkartOrders.jsx";
import FlipkartShipments from "./Shipment V3/FlipkartShipments.jsx";
import FlipkartReturns from "./Returns/FlipkartReturns.jsx";
import FlipkartReports from "./Reports APIs/FlipkartReports.jsx";
import "./FlipkartDashboard.css";

const FlipkartDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard":
        return (
          <div>
            <h1>Flipkart Dashboard</h1>
            <p>Manage Flipkart Seller APIs - Same Seller → Customer flow as Amazon & MyStore</p>
            <Sellerlist />
          </div>
        );
      case "sellers":
        return <Sellerlist />;
      case "seller-detail":
        return <SellerCustomerlist />;
      case "seller-customers":
        return <SellerCustomerlist />;
      case "listings":
        return <ListingsCommonV3Api />;
      case "products":
        return <FlipkartProducts />;
      case "inventory":
        return <FlipkartInventoryFBF />;
      case "pricing":
        return <FlipkartPricing />;
      case "orders":
        return <FlipkartOrders />;
      case "shipments":
        return <FlipkartShipments />;
      case "returns":
        return <FlipkartReturns />;
      case "reports":
        return <FlipkartReports />;
      default:
        return <Sellerlist />;
    }
  };

  return (
    <div className="flipkart-dashboard-layout">
      <FlipkartSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flipkart-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FlipkartDashboard;