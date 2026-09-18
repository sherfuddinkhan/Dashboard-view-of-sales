import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MarketplaceSelector from "./components/Common/MarketplaceSelector.jsx";
import AmazonDashboard from "./components/Amazon/AmazonDashboard.jsx";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard.jsx";
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard.jsx";
import AddProduct from "./components/MyStore/AddProduct.jsx";
// For future marketplaces - placeholder
const PlaceholderDashboard = ({ name }) => (
  <div style={{ padding: 40 }}>
    <h1>{name} Dashboard - Coming Soon</h1>
    <button onClick={() => window.location.href = "/marketplaces"}>← Back to Marketplaces</button>
  </div>
);



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketplaceSelector />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />

        {/* ADD-PRODUCT - MUST BE BEFORE /* - THIS FIXES YOUR REDIRECT */}
        <Route path="/mystore/add-product" element={<MyStoreDashboard />} />
        <Route path="/marketplaces/:marketplace/add-product" element={<MyStoreDashboard />} />

        {/* AMAZON */}
        <Route path="/marketplaces/amazon" element={<AmazonDashboard />} />
        <Route path="/marketplaces/amazon/*" element={<AmazonDashboard />} />

        {/* FLIPKART */}
        <Route path="/marketplaces/flipkart" element={<FlipkartDashboard />} />
        <Route path="/marketplaces/flipkart/*" element={<FlipkartDashboard />} />

        {/* MYSTORE */}
        <Route path="/mystore" element={<MyStoreDashboard />} />
        <Route path="/mystore/sellers" element={<MyStoreDashboard />} />
        <Route path="/mystore/sellers/:sellerId" element={<MyStoreDashboard />} />
        <Route path="/mystore/customers" element={<MyStoreDashboard />} />
        <Route path="/mystore/customers/:sellerId/:customerId" element={<MyStoreDashboard />} />
        <Route path="/mystore/*" element={<MyStoreDashboard />} />

        <Route path="/marketplaces/meesho/*" element={<PlaceholderDashboard name="Meesho" />} />
        <Route path="/marketplaces/blinkit/*" element={<PlaceholderDashboard name="Blinkit" />} />
        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;