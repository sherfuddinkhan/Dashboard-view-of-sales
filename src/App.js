import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import LandingPage from "./components/Common/LandingPage";
import Sellerlist from "./components/Common/Sellerlist";
import SellerCustomerlist from "./components/Common/SellerCustomerlist";

import AmazonLayout from "./components/Amazon/AmazonLayout";
import FlipkartLayout from "./components/Flipkart/FlipkartLayout";
import ListingsCommonV3Api from "./components/Flipkart/Catalog APIs/ListingsCommonV3Api";

import MeeshoDashboard from "./components/Meesho/MeeshoDashboard";
import BlinkitDashboard from "./components/Blinkit/BlinkitDashboard";
import MyntraDashboard from "./components/Myntra/MyntraDashboard";
import JioMartDashboard from "./components/JioMart/JioMartDashboard";
import ShopifyDashboard from "./components/Shopify/ShopifyDashboard";

import MyStoreLayout from "./components/MyStore/MyStoreLayout";
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard";
import ListAllOrders from "./components/MyStore/ListAllOrders";
import GetOrder from "./components/MyStore/GetOrder";
import CancelOrder from "./components/MyStore/CancelOrder";
import UpdateFulfillment from "./components/MyStore/UpdateFulfillment";
import ListProducts from "./components/MyStore/ListProducts";
import FilterProducts from "./components/MyStore/FilterProducts";
import GetProduct from "./components/MyStore/GetProduct";
import AddProduct from "./components/MyStore/AddProduct";
import EditProduct from "./components/MyStore/EditProduct";
import DeleteProduct from "./components/MyStore/DeleteProduct";
import AdjustInventoryByProductId from "./components/MyStore/AdjustInventoryByProductId";
import AdjustInventoryBySku from "./components/MyStore/AdjustInventoryBySku";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* COMMON */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />

        {/* AMAZON - WITH LEFT SIDEBAR - ALWAYS VISIBLE */}
        <Route path="/marketplaces/amazon" element={<AmazonLayout />}>
          <Route index element={<Navigate to="sellers" replace />} />
          <Route path="dashboard" element={<div className="amazon-overview-card"><h2>Amazon SP-API Overview</h2><p>Manage SP-API</p></div>} />
          <Route path="sellers" element={<Sellerlist />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist />} />
          {/* Add your Amazon API routes here - they will keep sidebar */}
          <Route path="auth/token" element={<div>Token Generator</div>} />
          <Route path="listings/create" element={<div>Create Listing - SKU, ASIN, Price, Qty</div>} />
          <Route path="orders/list" element={<div>Amazon Orders</div>} />
        </Route>

        {/* FLIPKART - WITH LEFT SIDEBAR - ALWAYS VISIBLE */}
        <Route path="/marketplaces/flipkart" element={<FlipkartLayout />}>
          <Route index element={<Navigate to="sellers" replace />} />
          <Route path="dashboard" element={<div><h2>Flipkart Overview</h2></div>} />
          <Route path="sellers" element={<Sellerlist />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist />} />
          <Route path="listings" element={<ListingsCommonV3Api />} />
          <Route path="listings/:sellerId/:customerId" element={<ListingsCommonV3Api />} />
          <Route path="products" element={<ListProducts />} />
          <Route path="orders" element={<ListAllOrders />} />
          <Route path="inventory/product" element={<AdjustInventoryByProductId />} />
          <Route path="inventory/sku" element={<AdjustInventoryBySku />} />
        </Route>

        {/* MYSTORE - WITH LEFT SIDEBAR */}
        <Route path="/mystore" element={<MyStoreLayout />}>
          <Route index element={<Navigate to="sellers" replace />} />
          <Route path="dashboard" element={<MyStoreDashboard />} />
          <Route path="sellers" element={<Sellerlist marketplace="mystore" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="mystore" />} />
          <Route path="orders" element={<ListAllOrders />} />
          <Route path="orders/get" element={<GetOrder />} />
          <Route path="orders/cancel" element={<CancelOrder />} />
          <Route path="orders/fulfillment" element={<UpdateFulfillment />} />
          <Route path="products" element={<ListProducts />} />
          <Route path="products/filter" element={<FilterProducts />} />
          <Route path="products/get" element={<GetProduct />} />
          <Route path="products/create" element={<AddProduct />} />
          <Route path="products/edit" element={<EditProduct />} />
          <Route path="products/delete" element={<DeleteProduct />} />
          <Route path="inventory/product" element={<AdjustInventoryByProductId />} />
          <Route path="inventory/sku" element={<AdjustInventoryBySku />} />
        </Route>

        {/* OTHER MARKETPLACES */}
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