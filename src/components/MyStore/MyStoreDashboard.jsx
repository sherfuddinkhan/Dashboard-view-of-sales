import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, ShoppingCart, Package, Boxes,
  ChevronDown, ChevronRight, Search, Filter, Edit, Trash2, Truck,
  XCircle, Hash, Menu, X, Plus, LogOut
} from "lucide-react";

// ✅ KEEP YOUR EXISTING IMPORTS - SAME FOLDER ROUTE
import Sellerlist from "../Common/Sellerlist.js";
import SellerCustomerlist from "../Common/SellerCustomerlist.js";
import AddProduct from "./AddProduct.jsx";

const Placeholder = ({ name }) => (
  <div style={{ padding: 30, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb" }}>
    <h2>{name}</h2>
    <p style={{ fontSize: 12, color: "#6b7280" }}>Route: {window.location.pathname} - Seller:Customer IDs binded here - Ready for API</p>
  </div>
);

const MyStoreDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState({
    seller: true,
    orders: true,
    products: true,
    inventory: true,
  });

  // ✅ WHEN MYSTORE LOADED → SELLERLIST PRESENT BY DEFAULT
  useEffect(() => {
    if (location.pathname === "/mystore" || location.pathname === "/mystore/" || location.pathname === "/mystore/dashboard") {
      navigate("/mystore/sellers", { replace: true });
    }
  }, [location.pathname, navigate]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const toggleGroup = (g) => setOpenGroups(p => ({...p, [g]:!p[g]}));
  const go = (path) => navigate(path);

  const menuBtn = (path, Icon, label, small = false) => (
    <button
      onClick={() => go(path)}
      className={`menu-item ${isActive(path)? "active" : ""} ${small? "small" : ""}`}
    >
      <Icon size={small? 14 : 18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      {/* SIDEBAR - DARK LIKE YOUR SCREENSHOT - ALL COMPONENTS */}
      <aside
        style={{
          width: sidebarOpen? 300 : 70,
          background: "#0f172a",
          color: "#fff",
          transition: "width 0.2s",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>MyStore</h2>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>12 APIs - Route shows IDs - List Binded</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            {sidebarOpen? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div style={{ padding: 12, flex: 1 }}>
          {menuBtn("/mystore/dashboard", LayoutDashboard, "Dashboard")}

          {/* SELLER MANAGEMENT - ALL */}
          {sidebarOpen && <div className="section-title">SELLER MANAGEMENT</div>}
          <div>
            <button onClick={() => toggleGroup("seller")} className="group-header">
              <Store size={16} /> {sidebarOpen && <><span>Sellers</span>{openGroups.seller? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.seller && (
              <div className="submenu">
                {menuBtn("/mystore/sellers", Store, "Sellers", true)}
                {menuBtn("/mystore/seller-customers", Users, "Seller Customers", true)}
                {menuBtn("/mystore/add-product", Package, "Add Product - Binded UI", true)}
              </div>
            )}
          </div>

          {/* ORDERS - 4 APIs */}
          {sidebarOpen && <div className="section-title">ORDERS</div>}
          <div>
            <button onClick={() => toggleGroup("orders")} className="group-header">
              <ShoppingCart size={16} /> {sidebarOpen && <><span>Orders</span>{openGroups.orders? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.orders && (
              <div className="submenu">
                {menuBtn("/mystore/orders", ShoppingCart, "All Orders", true)}
                {menuBtn("/mystore/orders/get", Hash, "Get Order", true)}
                {menuBtn("/mystore/orders/cancel", XCircle, "Cancel Order", true)}
                {menuBtn("/mystore/orders/fulfillment", Truck, "Update Fulfillment", true)}
              </div>
            )}
          </div>

          {/* CATALOG & PRODUCTS - 6 APIs */}
          {sidebarOpen && <div className="section-title">CATALOG & PRODUCTS</div>}
          <div>
            <button onClick={() => toggleGroup("products")} className="group-header">
              <Package size={16} /> {sidebarOpen && <><span>Products</span>{openGroups.products? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.products && (
              <div className="submenu">
                {menuBtn("/mystore/products", Package, "All Products", true)}
                {menuBtn("/mystore/products/filter", Filter, "Filter Products", true)}
                {menuBtn("/mystore/products/get", Search, "Get Product", true)}
                {menuBtn("/mystore/products/create", Plus, "Add Product", true)}
                {menuBtn("/mystore/products/edit", Edit, "Edit Product", true)}
                {menuBtn("/mystore/products/delete", Trash2, "Delete Product", true)}
              </div>
            )}
          </div>

          {/* INVENTORY - 2 APIs */}
          {sidebarOpen && <div className="section-title">INVENTORY</div>}
          <div>
            <button onClick={() => toggleGroup("inventory")} className="group-header">
              <Boxes size={16} /> {sidebarOpen && <><span>Inventory</span>{openGroups.inventory? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.inventory && (
              <div className="submenu">
                {menuBtn("/mystore/inventory/product", Package, "Adjust by Product ID", true)}
                {menuBtn("/mystore/inventory/sku", Hash, "Adjust by SKU", true)}
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
            <button onClick={() => navigate("/marketplaces")} style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: "8px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ← Marketplace Selector
            </button>
            <button onClick={() => { localStorage.clear(); navigate("/marketplaces"); }} style={{ width: "100%", padding: "10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: "8px", cursor: "pointer", fontWeight: 600, display: "flex", justifyContent: "center", gap: 6 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - ALL COMPONENTS RENDER HERE */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: "#fff", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6, cursor: "pointer" }}>
            <Menu size={18} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{location.pathname}</span>
        </div>

        <div style={{ padding: 16 }}>
          <Routes>
            <Route index element={<Sellerlist marketplace="mystore" />} />
            <Route path="dashboard" element={<Sellerlist marketplace="mystore" />} />
            <Route path="sellers" element={<Sellerlist marketplace="mystore" />} />
            <Route path="seller-customers" element={<Sellerlist marketplace="mystore" />} />
            <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="mystore" />} />
            <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="mystore" />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="products/create" element={<AddProduct />} />
            <Route path="products/*" element={<Placeholder name="MyStore Products API" />} />
            <Route path="orders/*" element={<Placeholder name="MyStore Orders API" />} />
            <Route path="inventory/*" element={<Placeholder name="MyStore Inventory API" />} />
            <Route path="*" element={<Sellerlist marketplace="mystore" />} />
          </Routes>
        </div>
      </main>

      <style>{`
       .section-title { font-size: 10px; font-weight: 700; color: #64748b; margin: 16px 0 6px 6px; letter-spacing: 0.6px; }
       .menu-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: transparent; border: 1px solid transparent; color: #cbd5e1; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; text-align: left; margin-bottom: 2px; }
       .menu-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
       .menu-item.active { background: #1e40af; color: #fff; border-color: #3b82f6; }
       .menu-item.small { padding-left: 28px; font-size: 12px; }
       .group-header { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; font-weight: 600; justify-content: space-between; }
       .group-header:hover { color: #fff; }
       .submenu { display: grid; gap: 2px; margin: 4px 0 8px 0; }
      `}</style>
    </div>
  );
};

export default MyStoreDashboard;