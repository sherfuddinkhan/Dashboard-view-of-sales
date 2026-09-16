import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FlipkartSidebar.css";

const FlipkartSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState("seller");

  const toggle = (menu) => setOpenMenu(openMenu === menu ? "" : menu);
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flipkart-sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-icon">🛒</span>
          <div>
            <div className="logo-title">Flipkart SP-API</div>
            <div className="logo-sub">Control Panel</div>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="sidebar-section">
        <div className="section-label">OAuth Required</div>
      </div>

      {/* MAIN DASHBOARDS */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("main")}>
          <span>⊞ Main Dashboards</span><span>{openMenu==="main" ? "∧" : "∨"}</span>
        </div>
        {openMenu==="main" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("/marketplaces/flipkart") ? "active" : ""}`} onClick={() => navigate("/marketplaces/flipkart")}>Flipkart Overview</div>
          </div>
        )}
      </div>

      {/* AUTH */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("auth")}>
          <span>🔑 Authentication</span><span>{openMenu==="auth" ? "∧" : "∨"}</span>
        </div>
        {openMenu==="auth" && (
          <div className="submenu">
            <div className="submenu-item" onClick={() => navigate("/marketplaces/flipkart/auth")}>Token Generator</div>
          </div>
        )}
      </div>

      {/* CATALOG APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("catalog")}>
          <span>📦 Seller & Catalog</span><span>›</span>
        </div>
        <div className="menu-title" onClick={() => toggle("catalog")}>
          <span>🧱 Product Types</span><span>›</span>
        </div>
      </div>

      {/* CATALOG APIs - Your Folder */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("seller")}>
          <span>📦 Catalog APIs</span><span>{openMenu==="seller" ? "∧" : "∨"}</span>
        </div>
        {openMenu==="seller" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("/marketplaces/flipkart/listings") ? "active" : ""}`} onClick={() => navigate("/marketplaces/flipkart/listings/6/3")}>ListingsCommon V3 API</div>
            <div className="submenu-item" onClick={() => navigate("/marketplaces/flipkart/catalog/listings")}>Get Listings</div>
            <div className="submenu-item" onClick={() => navigate("/marketplaces/flipkart/catalog/products")}>Products</div>
          </div>
        )}
      </div>

      {/* INVENTORY APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("inventory")}>
          <span>📦 Inventory APIs</span><span>›</span>
        </div>
        {openMenu==="inventory" && (
          <div className="submenu">
            <div className="submenu-item" onClick={() => navigate("/marketplaces/flipkart/inventory/update")}>Update Inventory</div>
            <div className="submenu-item" onClick={() => navigate("/marketplaces/flipkart/inventory/locations")}>Warehouse Locations</div>
          </div>
        )}
      </div>

      {/* ORDERS APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("orders")}>
          <span>🛒 Orders & Reports</span><span>{openMenu==="orders" ? "∧" : "∨"}</span>
        </div>
        {openMenu==="orders" && (
          <div className="submenu">
            <div className="submenu-item">Orders APIs</div>
            <div className="submenu-item">Shipments</div>
            <div className="submenu-item">Returns</div>
          </div>
        )}
      </div>

      {/* PAYMENTS */}
      <div className="menu-group">
        <div className="menu-title"><span>💲 Payments</span><span>›</span></div>
      </div>

      {/* REPORTS */}
      <div className="menu-group">
        <div className="menu-title"><span>📊 Reports APIs</span><span>›</span></div>
      </div>

      <div className="menu-group"><div className="menu-title"><span>🔔 Notifications</span><span>›</span></div></div>
      <div className="menu-group"><div className="menu-title"><span>🚚 Shipping</span><span>›</span></div></div>
      <div className="menu-group"><div className="menu-title"><span>💬 Messaging</span><span>›</span></div></div>
      <div className="menu-group"><div className="menu-title"><span>🌐 Feeds & Uploads</span><span>›</span></div></div>

      <div className="sidebar-footer" onClick={() => navigate("/")}><span>↪ Logout</span></div>
    </div>
  );
};

export default FlipkartSidebar;