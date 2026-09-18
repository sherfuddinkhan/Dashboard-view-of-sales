import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3, Key, ShoppingBag, Layers,
  Package, ShoppingCart, DollarSign, Bell, Truck,
  MessageSquare, Globe, ChevronDown, ChevronRight,
  Menu, X, LogOut, Store, Users, LayoutDashboard
} from "lucide-react";
import "./AmazonDashboard.css";

const AmazonLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState({
    sellers: true, dashboards: true, auth: true, seller: true,
    product: true, listings: true, orders: true, finances: true,
    notifications: true, shipping: true, messaging: true, feeds: true,
  });

  const toggleCategory = (key) => setExpanded(p => ({...p, [key]:!p[key]}));
  const goTo = (path) => navigate(path);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("amazon_token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/marketplaces", { replace: true });
  };

  const menu = [
    {
      key: "sellers",
      title: "Seller Management",
      icon: Store,
      items: [
        { label: "🏪 Sellers List [Click Seller → Customers]", path: "/marketplaces/amazon/sellers" },
        { label: "👥 All Seller Customers", path: "/marketplaces/amazon/seller-customers" },
        { label: "📊 Amazon Overview", path: "/marketplaces/amazon/dashboard" },
      ]
    },
    { key: "auth", title: "Authentication", icon: Key, items: [
      { label: "Token Generator", path: "/marketplaces/amazon/auth/token" },
    ]},
    { key: "seller", title: "Seller & Catalog", icon: ShoppingBag, items: [
      { label: "Marketplace Participations", path: "/marketplaces/amazon/seller/marketplace" },
      { label: "Catalog Search", path: "/marketplaces/amazon/seller/catalog-search" },
      { label: "Catalog Details", path: "/marketplaces/amazon/seller/catalog" },
      { label: "Pricing", path: "/marketplaces/amazon/seller/pricing" },
      { label: "Inventory", path: "/marketplaces/amazon/seller/inventory" },
    ]},
    { key: "product", title: "Product Types", icon: Layers, items: [
      { label: "Product Type Definition", path: "/marketplaces/amazon/product/types" },
      { label: "Search Product Types", path: "/marketplaces/amazon/product/search" },
      { label: "Product Type Schema", path: "/marketplaces/amazon/product/schema" },
    ]},
    { key: "listings", title: "Listings", icon: Package, items: [
      { label: "Create Listing", path: "/marketplaces/amazon/listings/create" },
      { label: "Get Listing", path: "/marketplaces/amazon/listings/get" },
      { label: "Update Listing", path: "/marketplaces/amazon/listings/update" },
      { label: "Delete Listing", path: "/marketplaces/amazon/listings/delete" },
      { label: "Submission Status", path: "/marketplaces/amazon/listings/submission" },
      { label: "Product Pricing", path: "/marketplaces/amazon/listings/pricing" },
    ]},
    { key: "orders", title: "Orders & Reports", icon: ShoppingCart, items: [
      { label: "Get Orders", path: "/marketplaces/amazon/orders/list" },
      { label: "Get Order Details", path: "/marketplaces/amazon/orders/get" },
      { label: "Get Order Items", path: "/marketplaces/amazon/orders/items" },
      { label: "Create Report", path: "/marketplaces/amazon/orders/report" },
      { label: "Get Report Document", path: "/marketplaces/amazon/orders/report-doc" },
    ]},
    { key: "finances", title: "Finances", icon: DollarSign, items: [
      { label: "Financial Events", path: "/marketplaces/amazon/finances" },
    ]},
    { key: "shipping", title: "Shipping", icon: Truck, items: [
      { label: "Get Rates", path: "/marketplaces/amazon/shipping/rates" },
      { label: "Purchase Label", path: "/marketplaces/amazon/shipping/label" },
      { label: "Tracking Details", path: "/marketplaces/amazon/shipping/tracking" },
    ]},
    { key: "messaging", title: "Messaging", icon: MessageSquare, items: [
      { label: "Message Templates", path: "/marketplaces/amazon/messaging/templates" },
      { label: "Send Message", path: "/marketplaces/amazon/messaging/send" },
    ]},
    { key: "feeds", title: "Feeds & Uploads", icon: Globe, items: [
      { label: "Create Feed Document", path: "/marketplaces/amazon/feeds/doc" },
      { label: "Create Feed", path: "/marketplaces/amazon/feeds/create" },
      { label: "Get Feed Status", path: "/marketplaces/amazon/feeds/status" },
    ]},
    { key: "notifications", title: "Notifications", icon: Bell, items: [
      { label: "Create Destination", path: "/marketplaces/amazon/notifications/destination" },
      { label: "Create Subscription", path: "/marketplaces/amazon/notifications/subscription" },
    ]},
  ];

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="icon-badge"><BarChart3 size={20} color="#fff" /></div>
            {sidebarOpen && <div><h1 className="brand-title">Amazon SP-API</h1><p className="brand-subtitle">Control Panel - 40 APIs</p></div>}
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="icon-button mobile-only"><X size={20}/></button>
        </div>

        <div className="sidebar-content">
          {/* Marketplace Selector */}
          <div style={{ padding: "12px" }}>
            <button onClick={() => navigate("/marketplaces")} style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
              ← Marketplace Selector
            </button>
          </div>

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

          {/* LOGOUT - FIXED */}
          <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: "20px" }}>
            <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="top-navbar">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="toggle-btn">{sidebarOpen? <X size={20}/> : <Menu size={20}/>}</button>
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

export default AmazonLayout;