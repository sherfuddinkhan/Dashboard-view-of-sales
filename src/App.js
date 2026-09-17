import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ============ ONLY IMPORT WHAT YOU HAVE ============
// These paths are from your screenshots - they exist
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator";

// Orders APIs - from your first screenshot
import GetOrder from "./components/Amazon/Orders APIs/GetOrder";
import GetOrderItems from "./components/Amazon/Orders APIs/GetOrderItems";
import Orders from "./components/Amazon/Orders APIs/Orders";

// Catalog APIs - from your second screenshot
import CatalogItem from "./components/Amazon/Catalog APIs/CatalogItem";
import CatalogSearch from "./components/Amazon/Catalog APIs/CatalogSearch";

// Data Kiosk - you have these
import GetDocument from "./components/Amazon/Data Kiosk/GetDocument";
import GetQuery from "./components/Amazon/Data Kiosk/GetQuery";

// CreateQuery - create if missing
import CreateQuery from "./components/Amazon/Data Kiosk/CreateQuery";

// FBA Outbound - you have this file
import FBAOutbound from "./components/Amazon/Fulfillment APIs/FBAOutbound";

// ============ DUMMY COMPONENTS FOR MISSING FILES ============
// To prevent Module not found errors, we define them here inline
const Dummy = ({ name }) => <div style={{ padding: 20 }}><h2>{name}</h2><p>Component coming soon...</p></div>;
const LandingPage = () => <Dummy name="Landing Page - Marketplace Selector" />;
const MarketplaceSelector = LandingPage;
const Sellerlist = () => <Dummy name="Seller List" />;
const SellerCustomerlist = () => <Dummy name="Seller Customer List" />;
const AmazonLayout = () => <div style={{ display: "flex" }}><div style={{ width: 220, background: "#111", color: "#fff", minHeight: "100vh", padding: 12 }}>Amazon Menu<br /><a href="/marketplaces/amazon/auth/token" style={{ color: "#fff" }}>Auth Token</a><br /><a href="/marketplaces/amazon/orders/list" style={{ color: "#fff" }}>List Orders</a><br /><a href="/marketplaces/amazon/orders/get" style={{ color: "#fff" }}>Get Order</a><br /><a href="/marketplaces/amazon/catalog/search" style={{ color: "#fff" }}>Catalog Search</a><br /><a href="/marketplaces/amazon/catalog/item" style={{ color: "#fff" }}>Catalog Item</a><br /><a href="/marketplaces/amazon/data-kiosk/get-query" style={{ color: "#fff" }}>Get Query</a><br /><a href="/marketplaces/amazon/data-kiosk/get-document" style={{ color: "#fff" }}>Get Document</a></div><div style={{ flex: 1 }}><Routes>
  <Route index element={<Navigate to="auth/token" replace />} />
  <Route path="auth/token" element={<TokenGenerator />} />
  <Route path="orders/list" element={<Orders />} />
  <Route path="orders/get" element={<GetOrder />} />
  <Route path="orders/get-items" element={<GetOrderItems />} />
  <Route path="catalog/search" element={<CatalogSearch />} />
  <Route path="catalog/item" element={<CatalogItem />} />
  <Route path="catalog/items" element={<CatalogSearch />} />
  <Route path="data-kiosk/create-query" element={<CreateQuery />} />
  <Route path="data-kiosk/get-query" element={<GetQuery />} />
  <Route path="data-kiosk/get-document" element={<GetDocument />} />
  <Route path="fulfillment/outbound" element={<FBAOutbound />} />
  <Route path="*" element={<div style={{ padding: 20 }}>Select from left menu</div>} />
</Routes></div></div>;

// Aliases
const GetOrderDetails = GetOrder;
const ListOrders = Orders;
const ListCatalogItems = CatalogSearch;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />
        
        {/* This one route contains everything you have */}
        <Route path="/marketplaces/amazon/*" element={<AmazonLayout />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/marketplaces/amazon" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;