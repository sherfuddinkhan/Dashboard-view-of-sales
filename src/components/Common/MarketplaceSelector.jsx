import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Store,
  Package,
  Zap,
  Shirt,
  Globe,
  ShoppingCart,
} from "lucide-react";
import "./MarketplaceSelector.css";

const marketplaces = [
  { name: "Amazon", icon: ShoppingBag, color: "#FF9900", path: "/marketplaces/amazon" },
  { name: "Flipkart", icon: ShoppingCart, color: "#2874F0", path: "/marketplaces/flipkart" },
  { name: "Meesho", icon: Store, color: "#E91E63", path: "/marketplaces/meesho" },
  { name: "Blinkit", icon: Zap, color: "#F7C600", path: "/marketplaces/blinkit" },
  { name: "Myntra", icon: Shirt, color: "#FF3F6C", path: "/marketplaces/myntra" },
  { name: "JioMart", icon: Package, color: "#0A66C2", path: "/marketplaces/jiomart" },
  { name: "Shopify", icon: Globe, color: "#96BF48", path: "/marketplaces/shopify" },
  { name: "MyStore", icon: Store, color: "#673AB7", path: "/mystore/sellers" },
];

const MarketplaceSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="marketplace-wrapper">
      <div className="marketplace-header">
        <h1>Marketplaces</h1>
        <p>Select a marketplace to manage your business</p>
      </div>
      <div className="marketplace-scroll">
        {marketplaces.map((marketplace) => {
          const Icon = marketplace.icon;
          const isActive = location.pathname.startsWith(marketplace.path) || (marketplace.path === "/mystore/sellers" && location.pathname.startsWith("/mystore"));
          return (
            <button key={marketplace.path} className={`marketplace-card ${isActive ? "active" : ""}`} onClick={() => navigate(marketplace.path)}>
              <div className="marketplace-icon" style={{ backgroundColor: `${marketplace.color}18`, color: marketplace.color }}>
                <Icon size={42} strokeWidth={1.8} />
              </div>
              <div className="marketplace-name">{marketplace.name}</div>
              <div className="marketplace-dashboard-text" style={{ color: marketplace.color }}>Open Dashboard →</div>
              {isActive && <div className="active-indicator" style={{ backgroundColor: marketplace.color }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceSelector;