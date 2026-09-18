import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ShoppingCart, Package, Boxes, RefreshCw, XCircle, Clock3,
  CheckCircle2, Users, Store, LayoutDashboard
} from "lucide-react";
import Sellerlist from "../Common/Sellerlist.js";
import SellerCustomerlist from "../Common/SellerCustomerlist.js";

import ListAllOrders from "./ListAllOrders.jsx";
import GetOrder from "./GetOrder.jsx";
import CancelOrder from "./CancelOrder.jsx";
import UpdateFulfillment from "./UpdateFulfillment.jsx";
import ListProducts from "./ListProducts.jsx";
import GetProduct from "./GetProduct.jsx";
import AddProduct from "./AddProduct.jsx";
import EditProduct from "./EditProduct.jsx";
import DeleteProduct from "./DeleteProduct.jsx";
import FilterProducts from "./FilterProducts.jsx";
import AdjustInventoryByProductId from "./AdjustInventoryByProductId.jsx";
import AdjustInventoryBySku from "./AdjustInventoryBySku.jsx";

import "./MyStoreDashboard.css";

const NODE_API = "http://localhost:5000/api";
const getApiError = (e, f) => e?.response?.data?.message || e?.message || f;
const formatPrice = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(v||0));
const formatDate = (v) => { if(!v) return "-"; const d=new Date(v); return isNaN(d.getTime())? "-": d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); };
const getStatusClass = (s) => { s=String(s||"").toLowerCase(); if(["delivered","completed"].includes(s)) return "status-success"; if(["cancelled"].includes(s)) return "status-danger"; if(["shipped"].includes(s)) return "status-info"; if(["pending","processing"].includes(s)) return "status-warning"; return "status-default"; };
const getOrderDate = (o) => o?.order_date || o?.orderDate || o?.created_at || 0;
const getOrderStatus = (o) => o?.status || "Unknown";
const getOrderTotal = (o) => o?.total?? 0;
const getProductInventory = (p) => p?.inventory_quantity?? 0;

const StatCard = ({ title, value, icon, onClick }) => (
  <div className={`mystore-stat-card ${onClick? "mystore-clickable": ""}`} onClick={onClick}>
    <div className="mystore-stat-content"><div className="mystore-stat-title">{title}</div><div className="mystore-stat-value">{value}</div></div>
    <div className="mystore-stat-icon">{icon}</div>
  </div>
);

const MyStoreDashboard = () => {
  const navigate = useNavigate();
  const params = useParams();
  const locationHook = useLocation();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [error, setError] = useState("");

  // READ URL ON REFRESH - FIXED FOR ADD-PRODUCT + CUSTOMERS + SELLERS
  useEffect(() => {
    const path = window.location.pathname;

    // 1. ADD-PRODUCT - THIS FIXES YOUR REDIRECT ISSUE
    if (path.includes("/add-product")) {
      setActiveTab("add-product");
      return;
    }
    // 2. /mystore/customers/S123/C456
    const match = path.match(/\/mystore\/customers\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, sId, cId] = match;
      setSelectedCustomer({ sellerId: sId, customerId: cId });
      setActiveTab("customer-detail");
      return;
    }
    // 3. /mystore/sellers/S123
    const match2 = path.match(/\/mystore\/sellers\/([^/]+)/);
    if (match2) {
      const [, sId] = match2;
      setSelectedSellerId(sId);
      setActiveTab("seller-detail");
      return;
    }
    // 4. /mystore/customers
    if (path.includes("/customers")) {
      setActiveTab("seller-customers");
      return;
    }
    // 5. /mystore/sellers
    if (path.includes("/sellers")) {
      setActiveTab("sellers");
      return;
    }
  }, [params, locationHook.pathname, locationHook.search]);

  const fetchOrders = async () => { try{ setOrdersLoading(true); const r=await axios.get(`${NODE_API}/mystore/orders`); const d=r.data?.data?? r.data; setOrders(Array.isArray(d)? d: []); }catch(e){ setError(getApiError(e,"Failed orders")); }finally{ setOrdersLoading(false); } };
  const fetchProducts = async () => { try{ setProductsLoading(true); const r=await axios.get(`${NODE_API}/mystore/products`); const d=r.data?.data?? r.data; setProducts(Array.isArray(d)? d: []); }catch(e){ setError(getApiError(e,"Failed products")); }finally{ setProductsLoading(false); } };
  const fetchSellers = async () => { try{ setSellersLoading(true); const r=await axios.get(`${NODE_API}/mystore/sellers`); setSellers(r.data?.data||r.data||[]); }catch(e){}finally{ setSellersLoading(false); } };
  const loadDashboard = async () => { setError(""); await Promise.all([fetchOrders(), fetchProducts(), fetchSellers()]); };
  useEffect(()=>{ loadDashboard(); },[]);

  const statistics = useMemo(()=>({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o=>["pending","processing"].includes(String(getOrderStatus(o)).toLowerCase())).length,
    cancelledOrders: orders.filter(o=>["cancelled"].includes(String(getOrderStatus(o)).toLowerCase())).length,
    deliveredOrders: orders.filter(o=>String(getOrderStatus(o)).toLowerCase()==="delivered").length,
    totalProducts: products.length,
    inventoryQuantity: products.reduce((t,p)=>t+Number(getProductInventory(p)||0),0),
    totalSellers: sellers.length
  }),[orders, products, sellers]);

  const recentOrders = useMemo(()=>[...orders].sort((a,b)=>new Date(getOrderDate(b)).getTime()-new Date(getOrderDate(a)).getTime()).slice(0,5),[orders]);

  const handleSellerSelect = (sellerId) => {
    setSelectedSellerId(sellerId);
    setActiveTab("seller-detail");
    navigate(`/mystore/sellers/${sellerId}`);
  };

  const handleCustomerSelect = (sellerId, customerId) => {
    setSelectedCustomer({ sellerId, customerId });
    setActiveTab("customer-detail");
    navigate(`/mystore/customers/${sellerId}/${customerId}`);
  };

  const handleBack = () => {
    setSelectedCustomer(null);
    setSelectedSellerId(null);
    setActiveTab("sellers");
    navigate("/mystore");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "dashboard") navigate("/mystore");
    if (tab === "sellers") navigate("/mystore/sellers");
    if (tab === "seller-customers") navigate("/mystore/customers");
    if (tab === "add-product") navigate("/mystore/add-product");
  };

  const renderContent = () => {
    // CRITICAL FIX: Check pathname directly for add-product - This stops redirect to dashboard
    if (window.location.pathname.includes("/add-product")) {
      return <AddProduct />;
    }

    switch(activeTab){
      case "sellers":
        return <Sellerlist marketplace="mystore" onCustomerClick={handleCustomerSelect} onSellerClick={handleSellerSelect} />;
      case "seller-customers":
        return <Sellerlist marketplace="mystore" onCustomerClick={handleCustomerSelect} />;
      case "seller-detail":
        return <Sellerlist marketplace="mystore" sellerId={selectedSellerId} onCustomerClick={handleCustomerSelect} onBack={()=>{ setActiveTab("sellers"); navigate("/mystore"); }} />;
      case "customer-detail":
        return (
          <SellerCustomerlist
            marketplace="mystore"
            sellerId={selectedCustomer?.sellerId || selectedSellerId}
            customerId={selectedCustomer?.customerId}
            onBack={handleBack}
          />
        );
      case "orders": return <ListAllOrders />;
      case "get-order": return <GetOrder />;
      case "cancel-order": return <CancelOrder />;
      case "fulfillment": return <UpdateFulfillment />;
      case "products": return <ListProducts />;
      case "get-product": return <GetProduct />;
      case "add-product": return <AddProduct />;
      case "edit-product": return <EditProduct />;
      case "delete-product": return <DeleteProduct />;
      case "filter-products": return <FilterProducts />;
      case "adjust-product": return <AdjustInventoryByProductId />;
      case "adjust-sku": return <AdjustInventoryBySku />;
      default:
        return (
          <div className="mystore-dashboard">
            <div className="mystore-topbar">
              <div><h1>MyStore Dashboard - 12 APIs</h1><p>URL now shows SellerId / CustomerId - Check address bar | List to Marketplace binded</p></div>
              <button className="mystore-refresh-button" onClick={loadDashboard}><RefreshCw size={17} /> Refresh</button>
            </div>
            {error && <div className="mystore-error"><span>{error}</span><button onClick={()=>setError("")}>×</button></div>}
            <section className="mystore-section">
              <div className="mystore-section-title">Seller Management</div>
              <div className="mystore-stat-grid">
                <StatCard title="Total Sellers" value={sellersLoading?"...":statistics.totalSellers} icon={<Store size={25} />} onClick={()=>handleTabChange("sellers")} />
                <StatCard title="Total Customers" value="View All" icon={<Users size={25} />} onClick={()=>handleTabChange("seller-customers")} />
                <StatCard title="Seller → Customer" value="Active" icon={<CheckCircle2 size={25} />} onClick={()=>handleTabChange("sellers")} />
                <StatCard title="Add Product" value="List to MyStore" icon={<Package size={25} />} onClick={()=>handleTabChange("add-product")} />
              </div>
            </section>
            <div className="mystore-content-grid">
              <section className="mystore-panel">
                <div className="mystore-panel-header"><div><h2>Recent Sellers</h2><p>Click to see customers - URL will show ID - List to MyStore/Flipkart/Amazon binded</p></div><button onClick={()=>handleTabChange("sellers")}>View All</button></div>
                <div className="mystore-table-wrapper">
                  <table className="mystore-table"><thead><tr><th>Seller ID</th><th>Name</th><th>Action</th></tr></thead>
                    <tbody>{sellers.length===0?<tr><td colSpan="3" className="mystore-empty">No sellers</td></tr>:sellers.slice(0,5).map(s=><tr key={s.sellerId} className="mystore-clickable-row" onClick={()=>handleSellerSelect(s.sellerId)}><td><strong>{s.sellerId}</strong></td><td>{s.sellerName}</td><td><button type="button" style={{background:"#3b82f6",color:"#fff",border:"none",padding:"4px 8px",borderRadius:"4px"}}>View Customers →</button></td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <aside style={{ width: "260px", background: "linear-gradient(180deg,#111827,#0f172a)", color: "#fff", padding: "20px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: "20px", fontWeight: 700 }}>MyStore</div>
        <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "16px" }}>12 APIs - Route shows IDs - List Binded</div>
        <button type="button" onClick={()=>handleTabChange("dashboard")} style={{ width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: "12px", borderRadius: "6px", border: activeTab==="dashboard"?"1px solid #3b82f6":"1px solid rgba(255,255,255,0.12)", background: activeTab==="dashboard"?"rgba(59,130,246,0.22)":"rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" }}><LayoutDashboard size={14} style={{ marginRight: "6px" }} /> Dashboard</button>
        <div style={{ marginBottom: "14px" }}><div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", padding: "6px 10px" }}>🏪 Seller Management</div>
          <button type="button" onClick={()=>handleTabChange("sellers")} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "6px", border: "none", background: activeTab==="sellers"?"rgba(59,130,246,0.22)":"transparent", color: "#cbd5e1", cursor: "pointer" }}>🏪 Sellers</button>
          <button type="button" onClick={()=>handleTabChange("seller-customers")} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "6px", border: "none", background: activeTab==="seller-customers"?"rgba(59,130,246,0.22)":"transparent", color: "#cbd5e1", cursor: "pointer" }}>👥 Seller Customers</button>
          <button type="button" onClick={()=>handleTabChange("add-product")} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", borderRadius: "6px", border: "none", background: activeTab==="add-product"?"rgba(59,130,246,0.22)":"transparent", color: "#cbd5e1", cursor: "pointer" }}>📦 Add Product - Binded UI</button>
        </div>
        <button type="button" onClick={()=>window.location.href="/marketplaces"} style={{ marginTop: "16px", width: "100%", padding: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "6px", cursor: "pointer" }}>← Marketplace Selector</button>
        <button type="button" onClick={()=>{localStorage.clear(); window.location.href="/marketplaces";}} style={{ marginTop: "8px", width: "100%", padding: "10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: "6px", cursor: "pointer" }}>🚪 Logout</button>
      </aside>
      <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>{renderContent()}</main>
    </div>
  );
};

export default MyStoreDashboard;