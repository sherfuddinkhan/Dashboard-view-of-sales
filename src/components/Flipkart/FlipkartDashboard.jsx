import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Users, Package, ShoppingBag, Search,
  Boxes, ShoppingCart, Hash, XCircle, Truck, ChevronDown, ChevronRight,
  Menu, X, LogOut
} from "lucide-react";

const FlipkartDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState({
    seller: true,
    customer: true,
    catalog: true,
    inventory: true,
    orders: true,
  });

  // ✅ When /marketplaces/flipkart loaded → Sellerlist present
  useEffect(() => {
    if (location.pathname === "/marketplaces/flipkart" || location.pathname === "/marketplaces/flipkart/") {
      navigate("/marketplaces/flipkart/sellers", { replace: true });
    }
  }, [location.pathname, navigate]);

  const isActive = (path) => {
    if (path.includes(":sellerId")) return false;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  const toggle = (k) => setOpenGroups(p => ({...p, [k]:!p[k]}));
  const go = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const btn = (path, Icon, label, small = false, badge = null) => (
    <button
      onClick={() => go(path)}
      className={`f-menu ${isActive(path)? "active" : ""} ${small? "small" : ""}`}
      title={path}
    >
      <Icon size={small? 14 : 18} />
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
      {badge && <span style={{ fontSize: 9, background: "#1e40af", padding: "2px 6px", borderRadius: 10 }}>{badge}</span>}
    </button>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      {/* SIDEBAR - DARK - ALL ROUTES */}
      <aside style={{ width: sidebarOpen? 320 : 70, background: "#0f172a", color: "#fff", height: "100vh", position: "sticky", top: 0, overflowY: "auto", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#2874F0" }}>Flipkart</h2>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>All APIs - Route shows Seller:Customer IDs - List Binded</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            {sidebarOpen? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div style={{ padding: 12, flex: 1 }}>
          {btn("/marketplaces/flipkart/dashboard", LayoutDashboard, "Dashboard")}

          {/* SELLER MANAGEMENT - ALL */}
          {sidebarOpen && <div className="f-title">SELLER MANAGEMENT</div>}
          <div>
            <button onClick={() => toggle("seller")} className="f-group">
              <Store size={16} /> {sidebarOpen && <><span>Sellers</span>{openGroups.seller? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.seller && (
              <div className="f-sub">
                {btn("/marketplaces/flipkart/sellers", Store, "Sellers List", true)}
                {btn("/marketplaces/flipkart/seller-customers", Users, "Seller Customers", true)}
              </div>
            )}
          </div>
          {/* CATALOG - LISTINGS V3 - MAIN */}
          {sidebarOpen && <div className="f-title">CATALOG - LISTINGS V3 (MAIN)</div>}
          <div>
            <button onClick={() => toggle("catalog")} className="f-group">
              <Package size={16} /> {sidebarOpen && <><span>Catalog APIs - V3</span>{openGroups.catalog? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.catalog && (
              <div className="f-sub">
                {btn("/marketplaces/flipkart/listings", Package, "All Listings", true)}
                {btn("/marketplaces/flipkart/catalog/search", Search, "Catalog Search", true)}
                {btn("/marketplaces/flipkart/catalog/products", Package, "All Products", true)}
              </div>
            )}
          </div>

          {/* INVENTORY */}
          {sidebarOpen && <div className="f-title">INVENTORY</div>}
          <div>
            <button onClick={() => toggle("inventory")} className="f-group">
              <Boxes size={16} /> {sidebarOpen && <><span>Inventory</span>{openGroups.inventory? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.inventory && (
              <div className="f-sub">
                {btn("/marketplaces/flipkart/inventory", Boxes, "Inventory - All", true)}
                {btn("/marketplaces/flipkart/inventory/product", Package, "Adjust by Product ID", true)}
                {btn("/marketplaces/flipkart/inventory/sku", Hash, "Adjust by SKU", true)}
              </div>
            )}
          </div>

          {/* ORDERS */}
          {sidebarOpen && <div className="f-title">ORDERS</div>}
          <div>
            <button onClick={() => toggle("orders")} className="f-group">
              <ShoppingCart size={16} /> {sidebarOpen && <><span>Orders</span>{openGroups.orders? <ChevronDown size={14} /> : <ChevronRight size={14} />}</>}
            </button>
            {sidebarOpen && openGroups.orders && (
              <div className="f-sub">
                {btn("/marketplaces/flipkart/orders", ShoppingCart, "All Orders", true)}
                {btn("/marketplaces/flipkart/orders/get", Hash, "Get Order", true)}
                {btn("/marketplaces/flipkart/orders/cancel", XCircle, "Cancel Order", true)}
                {btn("/marketplaces/flipkart/orders/fulfillment", Truck, "Update Fulfillment", true)}
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
            <button onClick={() => navigate("/marketplaces")} style={{ width: "100%", padding: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ← Marketplace Selector
            </button>
            <button onClick={() => navigate("/mystore/sellers")} style={{ width: "100%", padding: 10, background: "rgba(103,58,183,0.2)", border: "1px solid rgba(103,58,183,0.3)", color: "#c4b5fd", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              🏪 Go to MyStore - Binded UI
            </button>
            <button onClick={() => { localStorage.clear(); navigate("/marketplaces"); }} style={{ width: "100%", padding: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "flex", justifyContent: "center", gap: 6, fontSize: 12 }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN - ALL ROUTES RENDER HERE - SIDEBAR PRESENT FOR EVERY ROUTE */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: "#fff", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6, cursor: "pointer" }}><Menu size={18} /></button>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#2874F0" }}>{location.pathname}</span>
            <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0284c7", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Flipkart Layout Present</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => navigate("/marketplaces/flipkart/sellers")} style={{ padding: "6px 10px", background: "#2874F0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Sellers</button>
            <button onClick={() => navigate("/marketplaces/flipkart/listings/v3/6/3")} style={{ padding: "6px 10px", background: "#111", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>V3 6/3</button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <Outlet />
        </div>
      </main>

      <style>{`
     .f-title { font-size: 10px; font-weight: 700; color: #64748b; margin: 16px 0 6px 6px; letter-spacing: 0.6px; }
     .f-menu { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: transparent; border: 1px solid transparent; color: #cbd5e1; border-radius: 8px; cursor: pointer; font-size: 13px; text-align: left; margin-bottom: 2px; }
     .f-menu:hover { background: rgba(40,116,240,0.15); color: #fff; }
     .f-menu.active { background: #2874F0; color: #fff; border-color: #3b82f6; }
     .f-menu.small { padding-left: 26px; font-size: 11.5px; }
     .f-group { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 13px; font-weight: 600; justify-content: space-between; }
     .f-group:hover { color: #fff; }
     .f-sub { display: grid; gap: 2px; margin: 4px 0 8px 0; }
      `}</style>
    </div>
  );
};

export default FlipkartDashboard;