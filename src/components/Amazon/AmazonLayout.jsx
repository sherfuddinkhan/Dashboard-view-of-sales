import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3, Key, ShoppingBag, Layers,
  Package, ShoppingCart, DollarSign, Bell, Truck,
  MessageSquare, Globe, ChevronDown, ChevronRight,
  Menu, X, LogOut, CheckCircle2, Lock, Store, LayoutDashboard
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

  const menu = [
    { key: "sellers", title: "Seller Management", icon: Store, items: [
      { label: "Sellers List", path: "/marketplaces/amazon/sellers" },
      { label: "Amazon Overview", path: "/marketplaces/amazon/dashboard" },
    ]},
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
            {sidebarOpen && <div><h1 className="brand-title">Amazon SP-API</h1><p className="brand-subtitle">Control Panel</p></div>}
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

export default AmazonLayout;