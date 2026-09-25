import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const menuData = [
  { id: "main", title: "MAIN", icon: "🏠", defaultOpen: true, items: [
    { path: "/uniware", label: "Dashboard - All 85 APIs", badge: "85" },
    { path: "/uniware/auth", label: "Authentication - FIXED", badge: "1" },
    { path: "/uniware/facility/search", label: "Search Facilities" },
    { path: "/uniware/facility/details", label: "Get Facility Details" },
    { path: "/uniware/export/create", label: "Create Export Job" },
    { path: "/uniware/export/status", label: "Get Export Job Status" },
  ]},
  { id: "fulfillment", title: "FULFILLMENT", icon: "📦", count: 32, defaultOpen: false, items: [
    { path: "/uniware/fulfillment/packages/search", label: "Search Shipping Packages" },
    { path: "/uniware/fulfillment/package/create", label: "Create Shipping Package" },
    { path: "/uniware/fulfillment/package/details", label: "Get Package Details" },
    { path: "/uniware/fulfillment/packages", label: "Get Shipping Packages" },
    { path: "/uniware/fulfillment/picklist/create", label: "Create Picklist" },
    { path: "/uniware/fulfillment/manifest/create", label: "Create Manifest" },
    { path: "/uniware/fulfillment/manifest/get", label: "Get Manifest" },
    { path: "/uniware/fulfillment/manifest/add", label: "Add Package to Manifest" },
    { path: "/uniware/fulfillment/manifest/complete", label: "Create Complete Manifest" },
    { path: "/uniware/fulfillment/manifest/close", label: "Close Manifest" },
    { path: "/uniware/fulfillment/provider/allocate", label: "Allocate Provider" },
    { path: "/uniware/fulfillment/serviceability", label: "Check Serviceability" },
    { path: "/uniware/fulfillment/invoice", label: "Create Invoice" },
    { path: "/uniware/fulfillment/invoice/with-details", label: "Invoice With Details" },
    { path: "/uniware/fulfillment/invoice/by-so", label: "Invoice By SaleOrder" },
    { path: "/uniware/fulfillment/invoice/label", label: "Invoice + Generate Label" },
    { path: "/uniware/fulfillment/invoice/create-label", label: "Invoice And Label" },
    { path: "/uniware/fulfillment/label/invoice", label: "Get Invoice Label" },
    { path: "/uniware/fulfillment/invoice/pdf", label: "Get Invoice PDF" },
    { path: "/uniware/fulfillment/label/pdf", label: "Get Shipping Label PDF" },
    { path: "/uniware/fulfillment/dispatch", label: "Create And Dispatch" },
    { path: "/uniware/fulfillment/dispatch/force", label: "Force Dispatch" },
    { path: "/uniware/fulfillment/package/mark-dispatched", label: "Mark Dispatched" },
    { path: "/uniware/fulfillment/package/mark-delivered", label: "Mark Delivered" },
    { path: "/uniware/fulfillment/package/modify", label: "Modify Package" },
    { path: "/uniware/fulfillment/package/split", label: "Split Package" },
    { path: "/uniware/fulfillment/package/update", label: "Update Package" },
    { path: "/uniware/fulfillment/seal/update", label: "Update Seal Id" },
    { path: "/uniware/fulfillment/seal/bulk-update", label: "Update Seal Id Bulk" },
    { path: "/uniware/fulfillment/tracking/update", label: "Update Tracking Status" },
    { path: "/uniware/fulfillment/reason-dropdown/enable", label: "Enable Reason Dropdown" },
  ]},
  { id: "saleorder", title: "SALE ORDER", icon: "🛒", count: 18, defaultOpen: false, items: [
    { path: "/uniware/saleorder/search", label: "Search Sale Orders" },
    { path: "/uniware/saleorder/create", label: "Create Sale Order" },
    { path: "/uniware/saleorder/get", label: "Get Sale Order" },
    { path: "/uniware/saleorder/update", label: "Update Sale Order" },
    { path: "/uniware/saleorder/cancel", label: "Cancel Sale Order" },
    { path: "/uniware/saleorder/verify", label: "Verify Sale Order" },
    { path: "/uniware/saleorder/hold", label: "Hold Sale Order" },
    { path: "/uniware/saleorder/unhold", label: "Unhold Sale Order" },
    { path: "/uniware/saleorder/items/hold", label: "Hold SO Items" },
    { path: "/uniware/saleorder/items/unhold", label: "Unhold SO Items" },
    { path: "/uniware/saleorder/priority/set", label: "Set SO Priority" },
    { path: "/uniware/saleorder/items/switch-facility", label: "Switch Facility SO Items" },
    { path: "/uniware/saleorder/customer/create", label: "Create Customer" },
    { path: "/uniware/saleorder/customer/update", label: "Update Customer" },
    { path: "/uniware/saleorder/item/add", label: "Add Item Details" },
    { path: "/uniware/saleorder/item/add-bulk", label: "Add Item Details Bulk" },
    { path: "/uniware/saleorder/metadata/update", label: "Update SO Metadata" },
    { path: "/uniware/saleorder/item/metadata/update", label: "Update SO Item Metadata" },
  ]},
  { id: "returns", title: "RETURNS", icon: "↩️", count: 11, defaultOpen: false, items: [
    { path: "/uniware/returns/search", label: "Search Returns" },
    { path: "/uniware/returns/get", label: "Get Return" },
    { path: "/uniware/returns/mark-returned", label: "Mark SaleOrder Returned" },
    { path: "/uniware/returns/mark-returned-inventory", label: "Mark Returned In Inventory" },
    { path: "/uniware/returns/reverse-pickup/create", label: "Create Reverse Pickup" },
    { path: "/uniware/returns/reverse-pickup/approve", label: "Approve Reverse Pickup" },
    { path: "/uniware/returns/reverse-pickup/cancel", label: "Cancel Reverse Pickup" },
    { path: "/uniware/returns/reverse-pickup/allocate", label: "Allocate Courier" },
    { path: "/uniware/returns/reverse-pickup/update", label: "Update Reverse Pickup" },
    { path: "/uniware/returns/alternate/create", label: "Create Alternate Item" },
    { path: "/uniware/returns/alternate/accept", label: "Accept Alternate Item" },
  ]},
  { id: "inbound", title: "INBOUND / PO", icon: "📥", count: 14, defaultOpen: false, items: [
    { path: "/uniware/inbound/po/search", label: "Search Purchase Orders" },
    { path: "/uniware/inbound/po/create", label: "Create PO" },
    { path: "/uniware/inbound/po/create-approved", label: "Create Approved PO" },
    { path: "/uniware/inbound/po/details", label: "Get PO Details" },
    { path: "/uniware/inbound/po/approve", label: "Approve PO" },
    { path: "/uniware/inbound/po/close", label: "Close PO" },
    { path: "/uniware/inbound/grn/search", label: "Search GRNs" },
    { path: "/uniware/inbound/grn/create", label: "Create GRN" },
    { path: "/uniware/inbound/grn/get", label: "Get GRN" },
    { path: "/uniware/inbound/grn/add-item", label: "Add GRN Item" },
    { path: "/uniware/inbound/grn/add-sku", label: "Add GRN SKU" },
    { path: "/uniware/inbound/vendor", label: "Vendor" },
    { path: "/uniware/inbound/vendor/backorder", label: "Vendor Backorder" },
  ]},
  { id: "inventory", title: "INVENTORY", icon: "📊", count: 6, defaultOpen: false, items: [
    { path: "/uniware/inventory/snapshot", label: "Inventory Snapshot" },
    { path: "/uniware/inventory/search", label: "Search Inventory" },
    { path: "/uniware/inventory/update", label: "Update Inventory" },
    { path: "/uniware/inventory/bulk-update", label: "Bulk Inventory Update" },
    { path: "/uniware/inventory/adjust", label: "Adjust Inventory" },
    { path: "/uniware/inventory/history", label: "Inventory History" },
  ]},
  { id: "outbound", title: "OUTBOUND / GATEPASS", icon: "🚪", count: 9, defaultOpen: false, items: [
    { path: "/uniware/outbound/gatepass/search", label: "Search Gatepass" },
    { path: "/uniware/outbound/gatepass/create", label: "Create Gatepass" },
    { path: "/uniware/outbound/gatepass/details", label: "Get Gatepass Details" },
    { path: "/uniware/outbound/gatepass/add", label: "Add Item To Gatepass" },
    { path: "/uniware/outbound/gatepass/add-traceable", label: "Add Traceable Item" },
    { path: "/uniware/outbound/gatepass/add-nontraceable", label: "Add Non-Traceable" },
    { path: "/uniware/outbound/gatepass/remove", label: "Remove Item" },
    { path: "/uniware/outbound/gatepass/close", label: "Close Gatepass" },
    { path: "/uniware/outbound/gatepass/cancel", label: "Cancel Gatepass" },
  ]},
  { id: "product", title: "PRODUCT", icon: "🏷️", count: 7, defaultOpen: false, items: [
    { path: "/uniware/product/search", label: "Search Items" },
    { path: "/uniware/product/details", label: "Get Item Details" },
    { path: "/uniware/product/barcode", label: "Get Barcode Details" },
    { path: "/uniware/product/item", label: "Create Or Update Item" },
    { path: "/uniware/product/items", label: "Create Or Update Items" },
    { path: "/uniware/product/category", label: "Create Or Update Category" },
    { path: "/uniware/product/channel-item", label: "Channel Item Create/Edit" },
  ]},
  { id: "traffic", title: "ALL MARKETPLACES TRAFFIC", icon: "📊", count: 124, defaultOpen: true, items: [
    { path: "/uniware/traffic/live", label: "All 124 Channels - Live Sync - One Frame", badge: "LIVE" },
    { path: "/uniware/traffic/all", label: "All Marketplaces Traffic View" },
    { path: "/uniware/channel/add", label: "Add Channel From My Software", badge: "NEW" },
  ]},
  { id: "cost", title: "COST & COMMISSION", icon: "💰", count: 3, defaultOpen: false, items: [
    { path: "/uniware/cost/structure", label: "Cost Structure Per Channel" },
    { path: "/uniware/cost/calculator", label: "Commission Calculator" },
  ]},
  { id: "ai", title: "AI PARAMS", icon: "🤖", count: 2, defaultOpen: false, items: [
    { path: "/uniware/ai/params", label: "AI Parameter Sender" },
    { path: "/uniware/ai/sales", label: "Sales Impact Params" },
  ]},
];

export default function UniwareLayoutVertical() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    menuData.forEach(m => { init[m.id] = m.defaultOpen; });
    const current = menuData.find(m => m.items.some(i => i.path === location.pathname));
    if (current) init[current.id] = true;
    return init;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState(null);
  const [baseUrl, setBaseUrl] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("uniware_token") || localStorage.getItem("uniware_access_token") || localStorage.getItem("token");
    const b = localStorage.getItem("uniware_base_url");
    setToken(t);
    setBaseUrl(b);
    setAuthChecked(true);
  }, [location.pathname]);

  const toggle = (id) => setOpenSections(s => ({ ...s, [id]: !s[id] }));
  
 // NEW - FIXED: goes outside layout to marketplaces, unmounts component:
const handleLogout = () => {
  localStorage.removeItem("uniware_token");
  localStorage.removeItem("uniware_access_token");
  localStorage.removeItem("uniware_refresh_token");
  localStorage.removeItem("uniware_base_url");
  localStorage.removeItem("token");
  localStorage.removeItem("uniware_user");
  localStorage.removeItem("uniware_tenant");
  localStorage.removeItem("uniware_dashboard_data");
  sessionStorage.clear();
  setToken(null);
  setBaseUrl(null);
  // Go OUTSIDE uniware layout
  window.location.replace("/marketplaces"); // ✅ Exits Uniware, goes to MarketplaceSelector
};

  if (!authChecked) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <aside style={{ width: sidebarOpen ? 320 : 60, background: "#111827", color: "#fff", transition: "width 0.25s", overflow: "hidden", display: "flex", flexDirection: "column", borderRight: "1px solid #1f2937", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "18px 16px", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {sidebarOpen && (<div><h2 style={{ margin: 0, fontSize: 14, whiteSpace: "nowrap" }}>Uniware Integration</h2><p style={{ margin: "3px 0 0", fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>85+ APIs • Calibruce • {token ? "✅ Auth" : "❌ No Auth"}</p></div>)}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "#1f2937", color: "#fff", border: "1px solid #374151", borderRadius: 6, padding: "6px 8px", cursor: "pointer", fontSize: 12 }}>{sidebarOpen ? "◀" : "▶"}</button>
        </div>

        {sidebarOpen && (
          <div style={{ padding: "10px 12px", background: token ? "#065f46" : "#7f1d1d", borderBottom: "1px solid #1f2937" }}>
            <div style={{ fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {token ? `✅ ${baseUrl || "Tenant"} - Token OK` : "❌ Not authenticated - Go to Authentication"}
            </div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Code Match: MySoftware == Uniware ✅ Required
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: sidebarOpen ? "10px 10px" : "10px 6px" }}>
          {menuData.map((section) => (
            <div key={section.id} style={{ marginBottom: 8 }}>
              <button onClick={() => toggle(section.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", background: openSections[section.id] ? "#1f2937" : "transparent", border: "1px solid transparent", color: "#e5e7eb", padding: sidebarOpen ? "10px 12px" : "10px 6px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textAlign: "left" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span>{section.icon}</span>{sidebarOpen && <span>{section.title}</span>}{sidebarOpen && section.count && <span style={{ background: "#374151", color: "#9ca3af", fontSize: 9, padding: "2px 6px", borderRadius: 10 }}>{section.count}</span>}</span>
                {sidebarOpen && <span style={{ fontSize: 10, transform: openSections[section.id] ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }}>▶</span>}
              </button>
              {openSections[section.id] && sidebarOpen && (
                <div style={{ marginTop: 6, marginLeft: 6, borderLeft: "1px solid #1f2937", paddingLeft: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                  {section.items.map((item) => {
                    const active = location.pathname === item.path;
                    return (<Link key={item.path} to={item.path} style={{ textDecoration: "none", fontSize: 11.5, padding: "7px 10px", borderRadius: 6, background: active ? "#3b82f6" : "#111827", color: active ? "#fff" : "#9ca3af", border: active ? "1px solid #60a5fa" : "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{item.label}</span>{item.badge && <span style={{ background: active ? "#fff" : "#1f2937", color: active ? "#3b82f6" : "#6b7280", fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>{item.badge}</span>}</Link>);
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #1f2937", background: "#0f172a" }}>
          {sidebarOpen ? (
            <div style={{ padding: "12px 12px" }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {location.pathname}</div>
              <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#dc2626", color: "#fff", border: "1px solid #ef4444", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🚪 Logout</button>
            </div>
          ) : (
            <div style={{ padding: "10px 6px", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <button onClick={handleLogout} title="Logout" style={{ background: "#dc2626", color: "#fff", border: "1px solid #ef4444", padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 14, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>🚪</button>
            </div>
          )}
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 5 }}>
          <div><h2 style={{ margin: 0, fontSize: 16, color: "#111827" }}>{location.pathname === "/uniware" ? "Dashboard - All 85+ APIs" : location.pathname.split("/").pop()?.replace(/-/g, " ")}</h2><p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>{location.pathname} {token ? "• ✅ Authenticated" : "• ❌ Not authenticated"}</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            {!token && <Link to="/uniware/auth" style={{ padding: "6px 12px", borderRadius: 6, background: "#dc2626", color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>🔐 Authenticate</Link>}
            <Link to="/marketplaces" style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb", textDecoration: "none", fontSize: 11, color: "#374151" }}>← Marketplaces</Link>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: "auto" }}>
          {!token && location.pathname !== "/uniware/auth" && !location.pathname.includes("/traffic") && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", margin: 20, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>❌ Unable to authenticate with Uniware - No token found</div>
              <div style={{ fontSize: 11, color: "#7f1d1d", marginTop: 6, lineHeight: 1.6 }}>
                1. Go to <Link to="/uniware/auth" style={{ fontWeight: 700 }}>Authentication</Link> and login with your tenant URL (e.g., https://calibruce.unicommerce.com)<br/>
                2. Your warehouses isActive=false - run: UPDATE warehouses SET isActive=1 WHERE customerId=3<br/>
                3. Channel code must match: MySoftware AMAZON == Uniware AMAZON<br/>
                4. If CORS error, use backend proxy - see UniwareAuthFix.jsx<br/>
                5. <b>For Traffic dashboard, DEMO mode works without auth - click Live Sync</b>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
