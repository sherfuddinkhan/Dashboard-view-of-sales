import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =========================================================
// COMMON COMPONENTS
// =========================================================

import LandingPage from "./components/LandingPage";
import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import AmazonSidebar from "./components/Amazon/AmazonSidebar";

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
// NO SIDEBAR HERE
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
// AMAZON LAYOUT
// AMAZON SIDEBAR ONLY
// =========================================================

const AmazonLayout = ({ children }) => {
  return (
    <div style={amazonLayoutStyles}>
      {/* AMAZON SIDEBAR */}
      <AmazonSidebar />

      {/* AMAZON CONTENT */}
      <main style={amazonLayoutStyles.content}>
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
            AFTER LOGIN
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
            AMAZON
            AMAZON SIDEBAR APPEARS HERE
        ================================================= */}
        <Route
          path="/marketplaces/amazon"
          element={
            <AmazonLayout>
              <AmazonDashboard />
            </AmazonLayout>
          }
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
            OLD DASHBOARD URL
        ================================================= */}
        <Route
          path="/dashboard"
          element={<Navigate to="/marketplaces" replace />}
        />

        {/* =================================================
            DEFAULT
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
};

marketplaceLayoutStyles.main = {
  width: "100%",
  minHeight: "100vh",
  boxSizing: "border-box",
};

// =========================================================
// AMAZON LAYOUT STYLES
// =========================================================

const amazonLayoutStyles = {
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#f8fafc",
};

amazonLayoutStyles.content = {
  flex: 1,
  marginLeft: "260px",
  minHeight: "100vh",
  width: "calc(100% - 260px)",
  boxSizing: "border-box",
  overflowX: "hidden",
};

export default App;