import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MarketplaceSelector from "./components/Common/MarketplaceSelector.jsx";
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard.jsx";
import AddProduct from "./components/MyStore/AddProduct.jsx";

// ✅ Layouts - All have sidebar + Outlet - ALL components inside layout files
import AmazonLayout from "./components/Amazon/AmazonLayout.jsx";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard.jsx";

// ✅ Seller → Customer → Listing - Perfect Binding - Keep same
import Sellerlist from "./components/Common/Sellerlist.js";
import SellerCustomerlist from "./components/Common/SellerCustomerlist.js";
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator.jsx";
import AmazonRootRedirect from "./components/Amazon/AmazonRootRedirect.jsx";

// ✅ KEEP YOUR ORIGINAL FOLDER ROUTES WITH SPACE - NO RENAME
import CreateListing from "./components/Amazon/Listings APIs/CreateListing.js";
import ListingsCommonV3Api from "./components/Flipkart/Catalog APIs/ListingsCommonV3Api.js";

const Placeholder = ({ name }) => (
  <div style={{ padding: 40 }}>
    <h1>{name} - Coming Soon</h1>
    <p style={{ fontSize: 12, color: "#6b7280" }}>Route: {window.location.pathname} - Binded IDs ready</p>
    <button onClick={() => window.location.href = "/marketplaces"} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer", marginTop: 12 }}>← Back to Marketplaces</button>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketplaceSelector />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />

        {/* MYSTORE - Dashboard itself is layout with sidebar - ALL 12 APIs inside dashboard file */}
        <Route path="/mystore/add-product" element={<AddProduct />} />
        <Route path="/mystore/customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="mystore" />} />
        <Route path="/mystore/*" element={<MyStoreDashboard />} />

        {/* ========== AMAZON - ALL 40 APIs KEPT IN AmazonLayout.jsx - SIDEBAR FOR EVERY ROUTE ========== */}
        <Route path="/marketplaces/amazon" element={<AmazonLayout />}>
          {/* WHEN MARKETPLACE LOADED → TOKEN → SELLERLIST */}
          <Route index element={<AmazonRootRedirect />} />
          <Route path="dashboard" element={<AmazonRootRedirect />} />

          {/* REAL TOKEN - NOT COMING SOON */}
          <Route path="auth/token" element={<TokenGenerator />} />

          {/* SELLERLIST PRESENT AFTER TOKEN - ALL */}
          <Route path="sellers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="amazon" />} />
          <Route path="seller-customers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="amazon" />} />

          {/* Amazon Real SP-API - KEEP SAME FOLDER PATH WITH SPACE - ALL COMPONENTS */}
          <Route path="listings/create" element={<CreateListing />} />
          <Route path="add-product" element={<CreateListing />} />
          <Route path="seller/marketplace" element={<Placeholder name="Marketplace Participations" />} />
          <Route path="seller/catalog-search" element={<Placeholder name="Catalog Search" />} />
          <Route path="seller/catalog" element={<Placeholder name="Catalog Details" />} />
          <Route path="seller/pricing" element={<Placeholder name="Pricing" />} />
          <Route path="seller/inventory" element={<Placeholder name="Inventory" />} />
        </Route>

        {/* ========== FLIPKART - SIDEBAR PRESENT FOR EVERY ROUTE INCLUDING /listings/v3/6/3 - ALL ROUTES ========== */}
        <Route path="/marketplaces/flipkart" element={<FlipkartDashboard />}>
          <Route index element={<Sellerlist marketplace="flipkart" />} />
          <Route path="dashboard" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="sellers" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="seller-customers" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="flipkart" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="flipkart" />} />
          {/* KEEP SAME FOLDER WITH SPACE - THIS NOW HAS SIDEBAR FOR EVERY ROUTE */}
          <Route path="listings/v3/:sellerId/:customerId" element={<ListingsCommonV3Api />} />
          <Route path="listings" element={<ListingsCommonV3Api />} />
          <Route path="catalog/search" element={<Placeholder name="Flipkart Catalog Search" />} />
          <Route path="catalog/products" element={<Placeholder name="Flipkart All Products" />} />
          <Route path="inventory" element={<Placeholder name="Flipkart Inventory" />} />
          <Route path="orders" element={<Placeholder name="Flipkart Orders" />} />
        </Route>

        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;