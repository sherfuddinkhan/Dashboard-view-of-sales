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
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard";

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
        <Route path="/mystore" element={<MyStoreDashboard />} />
        <Route path="/mystore/orders" element={<ListAllOrders />} />
<Route path="/mystore/orders/get" element={<GetOrder />} />
<Route path="/mystore/orders/cancel" element={<CancelOrder />} />
<Route path="/mystore/orders/fulfillment" element={<UpdateFulfillment />} />

<Route path="/mystore/products" element={<ListProducts />} />
<Route path="/mystore/products/filter" element={<FilterProducts />} />
<Route path="/mystore/products/get" element={<GetProduct />} />
<Route path="/mystore/products/create" element={<AddProduct />} />
<Route path="/mystore/products/edit" element={<EditProduct />} />
<Route path="/mystore/products/delete" element={<DeleteProduct />} />

<Route
  path="/mystore/inventory/product"
  element={<AdjustInventoryByProductId />}
/>

<Route
  path="/mystore/inventory/sku"
  element={<AdjustInventoryBySku />}
/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;