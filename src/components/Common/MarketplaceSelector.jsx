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
  {
    name: "Amazon",
    icon: ShoppingBag,
    color: "#FF9900",
    path: "/marketplaces/amazon",
  },
  {
    name: "Flipkart",
    icon: ShoppingCart,
    color: "#2874F0",
    path: "/marketplaces/flipkart",
  },
  {
    name: "Meesho",
    icon: Store,
    color: "#E91E63",
    path: "/marketplaces/meesho",
  },
  {
    name: "Blinkit",
    icon: Zap,
    color: "#F7C600",
    path: "/marketplaces/blinkit",
  },
  {
    name: "Myntra",
    icon: Shirt,
    color: "#FF3F6C",
    path: "/marketplaces/myntra",
  },
  {
    name: "JioMart",
    icon: Package,
    color: "#0A66C2",
    path: "/marketplaces/jiomart",
  },
  {
    name: "Shopify",
    icon: Globe,
    color: "#96BF48",
    path: "/marketplaces/shopify",
  },
];

const MarketplaceSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="marketplace-wrapper">

      {/* HEADER */}
      <div className="marketplace-header">
        <h1>Marketplaces</h1>

        <p>
          Select a marketplace to manage your business
        </p>
      </div>

      {/* MARKETPLACE CARDS */}
      <div className="marketplace-scroll">

        {marketplaces.map((marketplace) => {

          const Icon = marketplace.icon;

          const isActive =
            location.pathname === marketplace.path ||
            location.pathname.startsWith(
              `${marketplace.path}/`
            );

          return (
            <button
              key={marketplace.path}
              type="button"
              className={`marketplace-card ${
                isActive ? "active" : ""
              }`}
              onClick={() => navigate(marketplace.path)}
            >

              {/* ICON */}
              <div
                className="marketplace-icon"
                style={{
                  backgroundColor: `${marketplace.color}18`,
                  color: marketplace.color,
                }}
              >
                <Icon
                  size={42}
                  strokeWidth={1.8}
                />
              </div>

              {/* NAME */}
              <div className="marketplace-name">
                {marketplace.name}
              </div>

              {/* DASHBOARD */}
              <div
                className="marketplace-dashboard-text"
                style={{
                  color: marketplace.color,
                }}
              >
                Open Dashboard →
              </div>

              {/* ACTIVE INDICATOR */}
              {isActive && (
                <div
                  className="active-indicator"
                  style={{
                    backgroundColor: marketplace.color,
                  }}
                />
              )}

            </button>
          );
        })}

      </div>
    </div>
  );
};

export default MarketplaceSelector;