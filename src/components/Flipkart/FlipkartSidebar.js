import React, { useState } from "react";
import "./FlipkartSidebar.css";

const FlipkartSidebar = ({ activeTab, setActiveTab, onClose, onLogout }) => {
  const [openMenu, setOpenMenu] = useState("seller-mgmt");

  const toggle = (menu) => setOpenMenu(openMenu === menu ? "" : menu);
  const isActive = (id) => activeTab === id ? "active" : "";
  const nav = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("flipkart_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      sessionStorage.clear();
      window.location.href = "/marketplaces";
    }
  };

  return (
    <div className="flipkart-sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="logo-box">
          <span className="logo-icon">🛒</span>
          <div>
            <div className="logo-title">Flipkart SP-API</div>
            <div className="logo-sub">16 APIs Control Panel</div>
          </div>
        </div>
      </div>

      {/* SELLER MANAGEMENT - Seller Click → Customers */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("seller-mgmt")}>
          <span>🏪 Seller Management</span>
          <span className="arrow">{openMenu === "seller-mgmt" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "seller-mgmt" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("sellers")}`} onClick={() => nav("sellers")}>
              🏪 Sellers [Click → Customers]
            </div>
            <div className={`submenu-item ${isActive("seller-detail")}`} onClick={() => nav("seller-customers")}>
              👥 Seller Customers
            </div>
            <div className={`submenu-item ${isActive("dashboard")}`} onClick={() => nav("dashboard")}>
              📊 Dashboard
            </div>
          </div>
        )}
      </div>

      {/* AUTH - 1 API - NEW */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("auth")}>
          <span>🔑 Auth (1)</span>
          <span className="arrow">{openMenu === "auth" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "auth" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("auth")}`} onClick={() => nav("auth")}>
              OAuth Token
            </div>
          </div>
        )}
      </div>

      {/* CATALOG - 4 APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("catalog")}>
          <span>📦 Catalog (4)</span>
          <span className="arrow">{openMenu === "catalog" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "catalog" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("listings")}`} onClick={() => nav("listings")}>
              Listings V3 Create
            </div>
            <div className={`submenu-item ${isActive("listings-update")}`} onClick={() => nav("listings-update")}>
              Listings Update / Get
            </div>
            <div className={`submenu-item ${isActive("products")}`} onClick={() => nav("products")}>
              Products
            </div>
            <div className={`submenu-item ${isActive("product-types")}`} onClick={() => nav("product-types")}>
              Product Types
            </div>
          </div>
        )}
      </div>

      {/* INVENTORY - 2 APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("inventory")}>
          <span>📊 Inventory (2)</span>
          <span className="arrow">{openMenu === "inventory" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "inventory" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("inventory")}`} onClick={() => nav("inventory")}>
              Inventory FBF
            </div>
            <div className={`submenu-item ${isActive("inventory-nonfbf")}`} onClick={() => nav("inventory-nonfbf")}>
              Inventory Non-FBF
            </div>
          </div>
        )}
      </div>

      {/* PRICING - 2 APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("pricing")}>
          <span>💰 Pricing (2)</span>
          <span className="arrow">{openMenu === "pricing" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "pricing" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("pricing")}`} onClick={() => nav("pricing")}>
              Pricing
            </div>
            <div className={`submenu-item ${isActive("pricing-promo")}`} onClick={() => nav("pricing-promo")}>
              Promotions / MRP
            </div>
          </div>
        )}
      </div>

      {/* ORDERS - 4 APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("orders")}>
          <span>🛒 Orders (4)</span>
          <span className="arrow">{openMenu === "orders" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "orders" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("orders")}`} onClick={() => nav("orders")}>
              Orders
            </div>
            <div className={`submenu-item ${isActive("shipments")}`} onClick={() => nav("shipments")}>
              Shipments V3
            </div>
            <div className={`submenu-item ${isActive("returns")}`} onClick={() => nav("returns")}>
              Returns
            </div>
            <div className={`submenu-item ${isActive("cancellations")}`} onClick={() => nav("cancellations")}>
              Cancellations
            </div>
          </div>
        )}
      </div>

      {/* FINANCE - 3 APIs */}
      <div className="menu-group">
        <div className="menu-title" onClick={() => toggle("finance")}>
          <span>💲 Finance & Reports (3)</span>
          <span className="arrow">{openMenu === "finance" ? "∧" : "∨"}</span>
        </div>
        {openMenu === "finance" && (
          <div className="submenu">
            <div className={`submenu-item ${isActive("payments")}`} onClick={() => nav("payments")}>
              Payments / Settlements
            </div>
            <div className={`submenu-item ${isActive("reports")}`} onClick={() => nav("reports")}>
              Reports
            </div>
            <div className={`submenu-item ${isActive("seller-profile")}`} onClick={() => nav("seller-profile")}>
              Seller Profile
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button className="footer-btn selector-btn" onClick={() => window.location.href = "/marketplaces"}>
          ← Marketplace Selector
        </button>
        <button className="footer-btn logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default FlipkartSidebar;