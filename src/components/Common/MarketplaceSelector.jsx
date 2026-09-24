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
  Warehouse,
} from "lucide-react";

import "./MarketplaceSelector.css";

const marketplaces = [
  {
    name: "Amazon",
    icon: ShoppingBag,
    color: "#FF9900",
    path: "/marketplaces/amazon",
    count: "40 APIs",
  },
  {
    name: "Flipkart",
    icon: ShoppingCart,
    color: "#2874F0",
    path: "/marketplaces/flipkart",
    count: "16 APIs",
  },
  {
    name: "MyStore",
    icon: Store,
    color: "#673AB7",
    path: "/mystore",
    count: "14 APIs",
  },
  {
    name: "Uniware",
    icon: Warehouse,
    color: "#2563EB",
    path: "/uniware",
    count: "100+ APIs",
  },
  {
    name: "Meesho",
    icon: Store,
    color: "#E91E63",
    path: "/marketplaces/meesho",
    count: "Soon",
  },
  {
    name: "Blinkit",
    icon: Zap,
    color: "#F7C600",
    path: "/marketplaces/blinkit",
    count: "Soon",
  },
  {
    name: "Myntra",
    icon: Shirt,
    color: "#FF3F6C",
    path: "/marketplaces/myntra",
    count: "Soon",
  },
  {
    name: "JioMart",
    icon: Package,
    color: "#0A66C2",
    path: "/marketplaces/jiomart",
    count: "Soon",
  },
  {
    name: "Shopify",
    icon: Globe,
    color: "#96BF48",
    path: "/marketplaces/shopify",
    count: "Soon",
  },
];

function MarketplaceSelector() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/mystore") {
      return location.pathname.startsWith("/mystore");
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="marketplace-wrapper">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="marketplace-header">
        <h1>Marketplaces & Integrations</h1>

        <p>
          Select a marketplace or integration to manage your
          Seller → Customer → Orders → Inventory flow
        </p>
      </div>

      {/* =====================================================
          MARKETPLACE CARDS
      ====================================================== */}

      <div className="marketplace-scroll">
        {marketplaces.map((mp) => {
          const Icon = mp.icon;
          const active = isActive(mp.path);

          return (
            <button
              key={mp.path}
              type="button"
              className={`marketplace-card ${
                active ? "active" : ""
              }`}
              onClick={() => navigate(mp.path)}
            >

              {/* =================================================
                  ICON
              ================================================= */}

              <div
                className="marketplace-icon"
                style={{
                  backgroundColor: `${mp.color}18`,
                  color: mp.color,
                }}
              >
                <Icon
                  size={42}
                  strokeWidth={1.8}
                />
              </div>

              {/* =================================================
                  NAME
              ================================================= */}

              <div className="marketplace-name">
                {mp.name}
              </div>

              {/* =================================================
                  API COUNT
              ================================================= */}

              <div
                className="marketplace-count"
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                {mp.count}
              </div>

              {/* =================================================
                  DASHBOARD LINK TEXT
              ================================================= */}

              <div
                className="marketplace-dashboard-text"
                style={{
                  color: mp.color,
                }}
              >
                Open Dashboard →
              </div>

              {/* =================================================
                  ACTIVE INDICATOR
              ================================================= */}

              {active && (
                <div
                  className="active-indicator"
                  style={{
                    backgroundColor: mp.color,
                  }}
                />
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MarketplaceSelector;