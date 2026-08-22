import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sellerlist from "./components/Amazon/Sellerlist";

// =========================================================
// COMMON COMPONENTS
// =========================================================

import LandingPage from "./components/Common/LandingPage";
import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import SellerCustomerlist from "./components/Amazon/SellerCustomerlist";
// =========================================================
// MARKETPLACE DASHBOARDS
// =========================================================

import AmazonDashboard from "./components/Amazon/AmazonDashboard";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard";
import MeeshoDashboard from "./components/Meesho/MeeshoDashboard";
import BlinkitDashboard from "./components/Blinkit/BlinkitDashboard";
import MyntraDashboard from "./components/Myntra/MyntraDashboard";
import JioMartDashboard from "./components/JioMart/JioMartDashboard";
import ShopifyDashboard from "./components/Shopify/ShopifyDashboard";

// =========================================================
// MARKETPLACE SELECTION LAYOUT
// =========================================================

const MarketplaceLayout = ({ children }) => {
  return (
    <div style={marketplaceLayoutStyles}>
      <main style={marketplaceLayoutStyles.main}>
        {children}
      </main>
    </div>
  );
};

// =========================================================
// APP
// =========================================================

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================
            LOGIN
        ================================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage />} />

        {/* =================================================
            MARKETPLACE SELECTION
        ================================================= */}
        <Route
          path="/marketplaces"
          element={
            <MarketplaceLayout>
              <MarketplaceSelector />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            AMAZON (Starts flush from the left screen edge)
        ================================================= */}
        <Route
          path="/marketplaces/amazon"
          element={<AmazonDashboard />}
        />
        <Route
  path="/marketplaces/amazon/customers"
  element={<SellerCustomerlist />}
/>
<Route
  path="/marketplaces/amazon/sellers"
  element={<Sellerlist />}
/>
        {/* =================================================
            FLIPKART
        ================================================= */}
        <Route
          path="/marketplaces/flipkart"
          element={
            <MarketplaceLayout>
              <FlipkartDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            MEESHO
        ================================================= */}
        <Route
          path="/marketplaces/meesho"
          element={
            <MarketplaceLayout>
              <MeeshoDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            BLINKIT
        ================================================= */}
        <Route
          path="/marketplaces/blinkit"
          element={
            <MarketplaceLayout>
              <BlinkitDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            MYNTRA
        ================================================= */}
        <Route
          path="/marketplaces/myntra"
          element={
            <MarketplaceLayout>
              <MyntraDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            JIOMART
        ================================================= */}
        <Route
          path="/marketplaces/jiomart"
          element={
            <MarketplaceLayout>
              <JioMartDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            SHOPIFY
        ================================================= */}
        <Route
          path="/marketplaces/shopify"
          element={
            <MarketplaceLayout>
              <ShopifyDashboard />
            </MarketplaceLayout>
          }
        />

        {/* =================================================
            OLD DASHBOARD URL REDIRECT
        ================================================= */}
        <Route
          path="/dashboard"
          element={<Navigate to="/marketplaces" replace />}
        />

        {/* =================================================
            DEFAULT FALLBACK
        ================================================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// =========================================================
// MARKETPLACE LAYOUT STYLES
// =========================================================

const marketplaceLayoutStyles = {
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
  main: {
    width: "100%",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
};

export default App;