import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MarketplaceSelector from "./components/Common/MarketplaceSelector.jsx";
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard.jsx";
import AddProduct from "./components/MyStore/AddProduct.jsx";

// ✅ Layouts
import AmazonLayout from "./components/Amazon/AmazonLayout.jsx";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard.jsx";

// ✅ Seller → Customer → Listing - Perfect Binding
import Sellerlist from "./components/Common/Sellerlist.js";
import SellerCustomerlist from "./components/Common/SellerCustomerlist.js";
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator.jsx";
import AmazonRootRedirect from "./components/Amazon/AmazonRootRedirect.jsx";

// ✅ FIX SPACE ISSUE - Rename folder "Listings APIs" to "ListingsAPIs" or use this:
import CreateListing from "./components/Amazon/Listings APIs/CreateListing.js";
import ListingsCommonV3Api from "./components/Flipkart/Catalog APIs/ListingsCommonV3Api.js";

const Placeholder = ({ name }) => (
  <div style={{ padding: 40 }}>
    <h1>{name} - Coming Soon</h1>
    <button onClick={() => window.location.href = "/marketplaces"}>← Back</button>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketplaceSelector />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />

        {/* MYSTORE */}
        <Route path="/mystore/add-product" element={<AddProduct />} />
        <Route path="/mystore/*" element={<MyStoreDashboard />} />

        {/* ========== AMAZON - ALL 40 APIs KEPT IN AmazonLayout.jsx ========== */}
        <Route path="/marketplaces/amazon" element={<AmazonLayout />}>
          {/* ✅ WHEN MARKETPLACE LOADED → TOKEN → SELLERLIST */}
          <Route index element={<AmazonRootRedirect />} />
          <Route path="dashboard" element={<AmazonRootRedirect />} />

          {/* ✅ REAL TOKEN - NOT COMING SOON */}
          <Route path="auth/token" element={<TokenGenerator />} />

          {/* ✅ SELLERLIST PRESENT AFTER TOKEN */}
          <Route path="sellers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="amazon" />} />
          <Route path="seller-customers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="amazon" />} />

          {/* Amazon Real SP-API - ALL KEPT */}
          <Route path="listings/create" element={<CreateListing />} />
          <Route path="add-product" element={<CreateListing />} />
          <Route path="seller/marketplace" element={<Placeholder name="Marketplace Participations" />} />
          <Route path="seller/catalog-search" element={<Placeholder name="Catalog Search" />} />
          <Route path="seller/catalog" element={<Placeholder name="Catalog Details" />} />
          <Route path="seller/pricing" element={<Placeholder name="Pricing" />} />
          <Route path="seller/inventory" element={<Placeholder name="Inventory" />} />
        </Route>

        {/* FLIPKART */}
        <Route path="/marketplaces/flipkart/*" element={<FlipkartDashboard />} />
        <Route path="/marketplaces/flipkart/sellers" element={<Sellerlist marketplace="flipkart" />} />
        <Route path="/marketplaces/flipkart/listings/v3/:sellerId/:customerId" element={<ListingsCommonV3Api />} />

        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;