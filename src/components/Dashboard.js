import React, { useState } from "react";

// ==================== ALL 19 COMPONENTS ====================
import AmazonTokenGenerator from "./Authentication/AmazonTokenGenerator";
import MarketplaceParticipations from "./Seller APIs/MarketplaceParticipations";
import CatalogItem from "./Catalog APIs/CatalogItem";

import CreateListing from "./Listings APIs/CreateListing";
import GetListing from "./Listings APIs/GetListing";
import UpdateListing from "./Listings APIs/UpdateListing";
import DeleteListing from "./Listings APIs/DeleteListing";
import ListingSubmission from "./Listings APIs/ListingSubmission";

import GetOrders from "./Orders APIs/Orders";
import GetOrder from "./Orders APIs/GetOrder";
import GetOrderItems from "./Orders APIs/GetOrderItems";

import Pricing from "./Pricing APIs/Pricing";

import CreateReport from "./Reports APIs/CreateReport";
import GetReport from "./Reports APIs/GetReport";
import GetReportDocument from "./Reports APIs/GetReportDocument";

import CreateFeedDocument from "./Feeds APIs/CreateFeedDocument";
import CreateFeed from "./Feeds APIs/CreateFeed";
import GetFeed from "./Feeds APIs/GetFeed";
import CreateUploadDestination from "./Uploads APIs/Uploads";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("token");

  const categories = [
    {
      title: "Authentication",
      items: [
        { id: "token", label: "Token Generator", comp: <AmazonTokenGenerator /> },
      ]
    },
    {
      title: "Seller & Catalog",
      items: [
        { id: "marketplace", label: "Marketplace Participations", comp: <MarketplaceParticipations /> },
        { id: "catalog", label: "Catalog Item", comp: <CatalogItem /> },
        { id: "pricing", label: "Pricing", comp: <Pricing /> },
      ]
    },
    {
      title: "Listings",
      items: [
        { id: "create-listing", label: "Create Listing", comp: <CreateListing /> },
        { id: "get-listing", label: "Get Listing", comp: <GetListing /> },
        { id: "update-listing", label: "Update Listing", comp: <UpdateListing /> },
        { id: "delete-listing", label: "Delete Listing", comp: <DeleteListing /> },
        { id: "listing-submission", label: "Listing Submission", comp: <ListingSubmission /> },
      ]
    },
    {
      title: "Orders",
      items: [
        { id: "get-orders", label: "Get Orders", comp: <GetOrders /> },
        { id: "get-order", label: "Get Order", comp: <GetOrder /> },
        { id: "get-order-items", label: "Get Order Items", comp: <GetOrderItems /> },
      ]
    },
    {
      title: "Reports",
      items: [
        { id: "create-report", label: "Create Report", comp: <CreateReport /> },
        { id: "get-report", label: "Get Report", comp: <GetReport /> },
        { id: "get-report-doc", label: "Get Report Document", comp: <GetReportDocument /> },
      ]
    },
    {
      title: "Feeds & Uploads",
      items: [
        { id: "create-feed-doc", label: "Create Feed Document", comp: <CreateFeedDocument /> },
        { id: "create-feed", label: "Create Feed", comp: <CreateFeed /> },
        { id: "get-feed", label: "Get Feed", comp: <GetFeed /> },
        { id: "upload-dest", label: "Upload Destination", comp: <CreateUploadDestination /> },
      ]
    },
  ];

  const allItems = categories.flatMap(cat => cat.items);
  const activeComponent = allItems.find(item => item.id === activeTab)?.comp;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1e2937" }}>
      {/* Vertical Sidebar with Categories */}
      <div style={{
        width: "300px",
        background: "#111827",
        color: "#e2e8f0",
        padding: "20px",
        overflowY: "auto",
        borderRight: "1px solid #334155"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#60a5fa" }}>
          Amazon SP-API
        </h2>

        {categories.map((category, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <div style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#94a3b8",
              fontWeight: "600",
              padding: "8px 12px",
              letterSpacing: "1px"
            }}>
              {category.title}
            </div>

            {category.items.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  marginBottom: "4px",
                  background: activeTab === item.id ? "#3b82f6" : "#1f2937",
                  color: activeTab === item.id ? "white" : "#cbd5e1",
                  border: "none",
                  borderRadius: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h1 style={{ color: "#f1f5f9", marginBottom: "30px" }}>Amazon SP-API Dashboard</h1>

        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          {activeComponent}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;