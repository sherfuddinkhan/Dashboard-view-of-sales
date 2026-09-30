import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./EasyEcomLayout.css";

const menu = [
  { title: "Dashboard", path: "/easyecom", icon: "📊" },
  { title: "Aggregators", items: [
    { name: "Check Company", path: "/easyecom/check-company" },
    { name: "Create Company V2", path: "/easyecom/create-client-company-v2" },
    { name: "Create Location", path: "/easyecom/create-client-location" },
  ]},
  { title: "Authorization", items: [
    { name: "Access Token", path: "/easyecom/access-token" },
    { name: "Child Locations", path: "/easyecom/get-child-locations" },
  ]},
  { title: "Inventory", items: [
    { name: "Bulk Update", path: "/easyecom/bulk-inventory-update" },
    { name: "Bulk Hold Update", path: "/easyecom/bulk-hold-inventory-update" },
    { name: "BatchCode Update", path: "/easyecom/bulk-inventory-update-batch" },
    { name: "Unified Update", path: "/easyecom/unified-bulk-inventory-update" },
    { name: "Inventory Details", path: "/easyecom/get-inventory-details" },
    { name: "Snapshot", path: "/easyecom/get-inventory-snapshot" },
    { name: "GRN Details", path: "/easyecom/get-grn-details" },
    { name: "Create ASN", path: "/easyecom/create-asn" },
    { name: "Create PO", path: "/easyecom/create-purchase-order" },
  ]},
  { title: "Orders", items: [
    { name: "Create Order V1", path: "/easyecom/create-order-v1" },
    { name: "Create Order V2", path: "/easyecom/create-order-v2" },
    { name: "Fetch Order V1", path: "/easyecom/fetch-order-v1" },
    { name: "Fetch Order V2", path: "/easyecom/fetch-order-v2" },
    { name: "Confirm Order V1", path: "/easyecom/confirm-order-v1" },
    { name: "Confirm Order V2", path: "/easyecom/confirm-order-v2" },
    { name: "Cancel Order V1", path: "/easyecom/cancel-order-v1" },
    { name: "Cancel Order V2", path: "/easyecom/cancel-order-v2" },
    { name: "Ready to Dispatch", path: "/easyecom/ready-to-dispatch-v1" },
    { name: "Batch Manifest", path: "/easyecom/batch-manifest-v1" },
    { name: "Get All Orders", path: "/easyecom/get-all-orders" },
    { name: "B2B Invoice", path: "/easyecom/generate-b2b-invoice" },
  ]},
  { title: "Product", items: [
    { name: "Create Listing", path: "/easyecom/create-listing" },
    { name: "Master Product", path: "/easyecom/create-master-product" },
    { name: "Get Master Product", path: "/easyecom/get-master-product" },
    { name: "Import Listing", path: "/easyecom/import-listing" },
    { name: "Map Listing", path: "/easyecom/map-listing" },
  ]},
  { title: "Reports", items: [
    { name: "List Reports", path: "/easyecom/list-reports" },
    { name: "Full Inventory", path: "/easyecom/full-inventory-report" },
    { name: "GRN Details", path: "/easyecom/grn-details-report" },
    { name: "Inventory Aging", path: "/easyecom/inventory-aging-report" },
  ]},
  { title: "Returns", items: [
    { name: "Get All Returns", path: "/easyecom/get-all-returns" },
    { name: "Get Pending Returns", path: "/easyecom/get-pending-returns" },
    { name: "Initiate RVP", path: "/easyecom/initiate-return-rvp" },
  ]},
  { title: "Shipment", items: [
    { name: "Create Shipment", path: "/easyecom/create-shipment" },
    { name: "List Carrier", path: "/easyecom/list-carrier" },
    { name: "Generate Manifest", path: "/easyecom/generate-manifest" },
    { name: "Tracking Details", path: "/easyecom/get-tracking-details" },
  ]},
];

export default function EasyEcomLayout() {
  const [open, setOpen] = useState({ Inventory: true });
  const toggle = (t) => setOpen(s => ({...s, [t]:!s[t]}));

  return (
    <div className="easyecom-wrapper">
      <div className="easyecom-sidebar">
        <div className="easyecom-logo">EasyEcom - 124 APIs</div>
        <nav>
          {menu.map(section => (
            <div key={section.title} className="menu-section">
              {section.path? (
                <NavLink to={section.path} className="menu-title">{section.icon} {section.title}</NavLink>
              ) : (
                <>
                  <div className="menu-title" onClick={()=>toggle(section.title)}>
                    {section.title} <span>{open[section.title]? '▲' : '▼'}</span>
                  </div>
                  {open[section.title] && (
                    <div className="submenu">
                      {section.items.map(it=>(
                        <NavLink key={it.path} to={it.path} className={({isActive})=> isActive? "active" : ""}>{it.name}</NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="easyecom-content">
        <Outlet />
      </div>
    </div>
  );
}