import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3, Key, ShoppingBag, Layers,
  Package, ShoppingCart, DollarSign, Bell, Truck,
  RotateCcw, FileText, ChevronDown, ChevronRight,
  Menu, X, Store, LayoutDashboard, Boxes, Tag
} from "lucide-react";
import "../MyStore/MyStoreDashboard.css";

const FlipkartLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState({
    sellers: true, dashboards: true, auth: true, catalog: true,
    pricing: true, inventory: true, orders: true, shipments: true,
    returns: true, reports: true,
  });

  const toggleCategory = (key) => setExpanded(p => ({...p, [key]:!p[key]}));
  const goTo = (path) => navigate(path);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const menu = [
    { key: "sellers", title: "Seller Management", icon: Store, items: [
      { label: "Sellers List", path: "/marketplaces/flipkart/sellers" },
      { label: "Flipkart Overview", path: "/marketplaces/flipkart/dashboard" },
    ]},
    { key: "auth", title: "Authentication", icon: Key, items: [
      { label: "Token Generator", path: "/marketplaces/flipkart/auth/token" },
      { label: "Seller Info", path: "/marketplaces/flipkart/auth/seller" },
    ]},
    { key: "catalog", title: "Catalog & Listings", icon: Package, items: [
      { label: "Listings V3 API", path: "/marketplaces/flipkart/listings" },
      { label: "Get Listing", path: "/marketplaces/flipkart/listings/get" },
      { label: "Create Listing", path: "/marketplaces/flipkart/listings/create" },
      { label: "Update Listing", path: "/marketplaces/flipkart/listings/update" },
      { label: "All Products", path: "/marketplaces/flipkart/products" },
      { label: "Product Details", path: "/marketplaces/flipkart/products/get" },
      { label: "Filter Products", path: "/marketplaces/flipkart/products/filter" },
    ]},
    { key: "pricing", title: "Pricing", icon: Tag, items: [
      { label: "Update Price", path: "/marketplaces/flipkart/pricing/update" },
      { label: "Update MRP", path: "/marketplaces/flipkart/pricing/mrp" },
      { label: "Special Price", path: "/marketplaces/flipkart/pricing/special" },
    ]},
    { key: "inventory", title: "Inventory - FBF", icon: Boxes, items: [
      { label: "Update Inventory", path: "/marketplaces/flipkart/inventory/update" },
      { label: "By Product ID", path: "/marketplaces/flipkart/inventory/product" },
      { label: "By SKU", path: "/marketplaces/flipkart/inventory/sku" },
      { label: "FBF Inventory", path: "/marketplaces/flipkart/inventory/fbf" },
    ]},
    { key: "orders", title: "Orders", icon: ShoppingCart, items: [
      { label: "All Orders", path: "/marketplaces/flipkart/orders" },
      { label: "Get Order", path: "/marketplaces/flipkart/orders/get" },
      { label: "Order Items", path: "/marketplaces/flipkart/orders/items" },
      { label: "Cancel Order", path: "/marketplaces/flipkart/orders/cancel" },
      { label: "Hold Order", path: "/marketplaces/flipkart/orders/hold" },
    ]},
    { key: "shipments", title: "Shipments", icon: Truck, items: [
      { label: "All Shipments", path: "/marketplaces/flipkart/shipments" },
      { label: "Get Shipment", path: "/marketplaces/flipkart/shipments/get" },
      { label: "Update Shipment", path: "/marketplaces/flipkart/shipments/update" },
      { label: "Ready To Dispatch", path: "/marketplaces/flipkart/shipments/rtd" },
    ]},
    { key: "returns", title: "Returns & Refunds", icon: RotateCcw, items: [
      { label: "All Returns", path: "/marketplaces/flipkart/returns" },
      { label: "Complete Return", path: "/marketplaces/flipkart/returns/complete" },
      { label: "Refund Status", path: "/marketplaces/flipkart/returns/refund" },
    ]},
    { key: "reports", title: "Reports", icon: FileText, items: [
      { label: "Sales Report", path: "/marketplaces/flipkart/reports/sales" },
      { label: "Inventory Report", path: "/marketplaces/flipkart/reports/inventory" },
      { label: "Returns Report", path: "/marketplaces/flipkart/reports/returns" },
    ]},
  ];

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="icon-badge" style={{background:'#2874F0'}}><ShoppingBag size={20} color="#fff" /></div>
            {sidebarOpen && <div><h1 className="brand-title">Flipkart Seller</h1><p className="brand-subtitle">API V3 Panel</p></div>}
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="icon-button mobile-only"><X size={20}/></button>
        </div>

        <div className="sidebar-content">
          {menu.map(cat => (
            <div key={cat.key} className="category-wrapper">
              <button onClick={()=>toggleCategory(cat.key)} className={`category-button ${expanded[cat.key]? "expanded" : ""}`}>
                <div className="category-info"><cat.icon size={18}/>{sidebarOpen && <span className="category-title">{cat.title}</span>}</div>
                {sidebarOpen && (expanded[cat.key]? <ChevronDown size={16}/> : <ChevronRight size={16}/>)}
              </button>
              {expanded[cat.key] && sidebarOpen && (
                <div className="submenu">
                  {cat.items.map(it => (
                    <button key={it.path} onClick={()=>goTo(it.path)} className={`submenu-button ${isActive(it.path)? "active" : ""}`}>
                      {it.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <main className="main-area">
        <header className="top-navbar">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="toggle-btn">{sidebarOpen? <ChevronRight size={20}/> : <Menu size={20}/>}</button>
          <h2 className="active-page-name">{location.pathname.split("/").pop() || "Dashboard"}</h2>
        </header>

        <section className="content-section">
          <div className="content-max-width">
            <div className="main-card"><div className="card-content"><Outlet /></div></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FlipkartLayout;