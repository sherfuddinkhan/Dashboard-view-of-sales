import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  FiKey, FiGlobe, FiBook, FiShoppingCart, FiFileText, 
  FiDollarSign, FiUpload, FiList, FiSettings, FiGrid, 
  FiChevronDown, FiChevronRight, FiMessageSquare, FiTruck, 
  FiBarChart2, FiUsers, FiTarget, FiAlertTriangle, FiPackage,
  FiLogOut
} from "react-icons/fi";

import "./Sidebar.css";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({
    dashboards: true,
    analytics: true,
    auth: false,
    catalog: false,
    listings: false,
    orders: false,
    shipping: false,
    messaging: false,
    feeds: false,
    settings: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuData = [
    {
      key: "dashboards",
      title: "Dashboards",
      items: [
        { path: "/dashboard/amazon", label: "Amazon Dashboard", icon: FiGrid },
        { path: "/dashboard/analytics", label: "Analytics Dashboard", icon: FiBarChart2 },
      ],
    },
    {
      key: "analytics",
      title: "ML Analytics",
      items: [
        { path: "/analytics/customer-segmentation", label: "Customer Segmentation", icon: FiUsers },
        { path: "/Analytics/RandomForestPrediction", label: "Sales/Product Prediction", icon: FiTarget },
        { path: "/Analytics/IsolationForestAnomaly", label: "Finance Anomaly Detection", icon: FiAlertTriangle },
        { path: "/analytics/product-recommendation", label: "Product Recommendation", icon: FiTarget },
        { path: "/analytics/abc-analysis", label: "ABC Analysis", icon: FiBarChart2 },
        { path: "/analytics/sales-forecast", label: "Sales Forecast", icon: FiBarChart2 },
        { path: "/analytics/return-prediction", label: "Return Prediction", icon: FiAlertTriangle },
        { path: "/analytics/fraud-detection", label: "Fraud Detection", icon: FiAlertTriangle },
        { path: "/analytics/inventory-analysis", label: "Inventory Analysis", icon: FiPackage },
        { path: "/analytics/recommendation-system", label: "Recommendation System", icon: FiTarget },
        { path: "/analytics/rfm-analysis", label: "RFM Analysis", icon: FiUsers },
      ],
    },
    {
      key: "auth",
      title: "Authentication",
      items: [
        { path: "/generate-token", label: "Token Generator", icon: FiKey },
      ],
    },
    {
      key: "catalog",
      title: "Seller & Catalog",
      items: [
        { path: "/marketplace", label: "Marketplace Participations", icon: FiGlobe },
        { path: "/catalog/search", label: "Catalog Item Search", icon: FiBook },
        { path: "/catalog/item", label: "Catalog Item Details", icon: FiBook },
        { path: "/pricing", label: "Pricing", icon: FiDollarSign },
        { path: "/inventory", label: "Inventory", icon: FiPackage },
      ],
    },
    {
      key: "listings",
      title: "Listings",
      items: [
        { path: "/listings/create", label: "Create Listing", icon: FiList },
        { path: "/listings/get", label: "Get Listing", icon: FiList },
        { path: "/listings/update", label: "Update Listing", icon: FiList },
        { path: "/listings/delete", label: "Delete Listing", icon: FiList },
        { path: "/listings/submission", label: "Listing Submission", icon: FiList },
        { path: "/listing/productprice", label: "Product Pricing", icon: FiDollarSign },
      ],
    },
    {
      key: "orders",
      title: "Orders & Reports",
      items: [
        { path: "/orders", label: "Get Orders", icon: FiShoppingCart },
        { path: "/order", label: "Get Order Details", icon: FiShoppingCart },
        { path: "/order-items", label: "Get Order Items", icon: FiShoppingCart },
        { path: "/reports/create", label: "Create Report", icon: FiFileText },
        { path: "/reports/get", label: "Get Report", icon: FiFileText },
        { path: "/reports/document", label: "Get Report Document", icon: FiFileText },
      ],
    },
    {
      key: "shipping",
      title: "Shipping",
      items: [
        { path: "/shipping", label: "Overview", icon: FiTruck },
        { path: "/shipping/get-rates", label: "Get Rates", icon: FiTruck },
        { path: "/shipping/purchase-label", label: "Purchase Label", icon: FiTruck },
        { path: "/shipping/tracking", label: "Tracking Details", icon: FiTruck },
      ],
    },
    {
      key: "messaging",
      title: "Messaging",
      items: [
        { path: "/messaging", label: "Overview", icon: FiMessageSquare },
        { path: "/messaging/templates", label: "Message Templates", icon: FiMessageSquare },
        { path: "/messaging/send", label: "Send Message", icon: FiMessageSquare },
      ],
    },
    {
      key: "feeds",
      title: "Feeds & Uploads",
      items: [
        { path: "/feeds/create-document", label: "Create Feed Document", icon: FiUpload },
        { path: "/feeds/create", label: "Create Feed", icon: FiUpload },
        { path: "/feeds/get", label: "Get Feed Status", icon: FiUpload },
      ],
    },
    {
      key: "settings",
      title: "Settings",
      items: [
        { path: "/settings", label: "Global Settings", icon: FiSettings },
      ],
    },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">Amazon SP-API</h2>
        <span className="sidebar-subtitle">Control Panel</span>
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-scroll-content">
        {menuData.map((section) => {
          const isOpen = openSections[section.key];
          return (
            <div key={section.key} className="sidebar-group">
              <button
                className={`sidebar-section-btn ${isOpen ? "active-group" : ""}`}
                onClick={() => toggleSection(section.key)}
              >
                <span className="section-title">{section.title}</span>
                <span className="chevron-icon">
                  {isOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="submenu-container">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? "active" : ""}`
                        }
                      >
                        <ItemIcon className="link-icon" size={16} />
                        <span className="link-text">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="sidebar-footer">
        <button className="logout-btn">
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;