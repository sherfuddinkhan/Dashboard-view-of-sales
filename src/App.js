import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// COMMON
import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import LandingPage from "./components/Common/LandingPage";

// AMAZON
import AmazonDashboard from "./components/Amazon/AmazonDashboard";
import Sellerlist from "./components/Amazon/Sellerlist";
import SellerCustomerlist from "./components/Amazon/SellerCustomerlist";

// FLIPKART - Fixed path (no space)
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard";
import FlipkartSellerlist from "./components/Flipkart/sellers/FlipkartSellerlist";
import ListingsCommonV3Api from "./components/Flipkart/Catalog APIs/ListingsCommonV3Api";

// OTHER MARKETPLACES
import MeeshoDashboard from "./components/Meesho/MeeshoDashboard";
import BlinkitDashboard from "./components/Blinkit/BlinkitDashboard";
import MyntraDashboard from "./components/Myntra/MyntraDashboard";
import JioMartDashboard from "./components/JioMart/JioMartDashboard";
import ShopifyDashboard from "./components/Shopify/ShopifyDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />

        {/* AMAZON */}
        <Route path="/marketplaces/amazon" element={<AmazonDashboard />} />
        <Route path="/marketplaces/amazon/sellers" element={<Sellerlist />} />
        <Route path="/marketplaces/amazon/customers/:sellerId/:customerId" element={<SellerCustomerlist />} />

        {/* FLIPKART */}
        <Route path="/marketplaces/flipkart" element={<FlipkartDashboard />} />
        <Route path="/marketplaces/flipkart/sellers" element={<FlipkartSellerlist />} />
        <Route path="/marketplaces/flipkart/listings" element={<ListingsCommonV3Api />} />
        <Route path="/marketplaces/flipkart/listings/:sellerId/:customerId" element={<ListingsCommonV3Api />} />

        {/* OTHERS */}
        <Route path="/marketplaces/meesho" element={<MeeshoDashboard />} />
        <Route path="/marketplaces/blinkit" element={<BlinkitDashboard />} />
        <Route path="/marketplaces/myntra" element={<MyntraDashboard />} />
        <Route path="/marketplaces/jiomart" element={<JioMartDashboard />} />
        <Route path="/marketplaces/shopify" element={<ShopifyDashboard />} />

        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;