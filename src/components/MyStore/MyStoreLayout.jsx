import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Boxes,
  ChevronDown, ChevronRight, Store, Search, Filter,
  Edit, Trash2, Truck, XCircle, Hash, Menu, X, Plus
} from "lucide-react";
import "./MyStoreDashboard.css";

const MyStoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openOrders, setOpenOrders] = useState(true);
  const [openProducts, setOpenProducts] = useState(true);
  const [openInventory, setOpenInventory] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const goTo = (path) => { navigate(path); setMobileSidebar(false); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="mystore-layout">
      <aside className={`mystore-sidebar ${mobileSidebar ? "mystore-sidebar-mobile-open" : ""}`}>
        <div className="mystore-sidebar-header">
          <div className="mystore-brand"><div className="mystore-brand-icon"><Package size={25} /></div><div><div className="mystore-brand-title">MyStore</div><div className="mystore-brand-subtitle">API Management</div></div></div>
          <button className="mystore-mobile-close" onClick={() => setMobileSidebar(false)}><X size={21} /></button>
        </div>
        <div className="mystore-sidebar-content">
          <button className={`mystore-menu-item ${isActive("/mystore/dashboard") ? "active" : ""}`} onClick={() => goTo("/mystore/dashboard")}><LayoutDashboard size={19} /><span>Dashboard</span></button>
          
          {/* SELLERS - DIRECT */}
          <button className={`mystore-menu-item ${isActive("/mystore/sellers") || isActive("/mystore/customers") ? "active" : ""}`} onClick={() => goTo("/mystore/sellers")}><Store size={19} /><span>Sellers</span></button>

          <div className="mystore-menu-group">
            <button className="mystore-menu-item group" onClick={() => setOpenOrders(!openOrders)}><ShoppingCart size={19} /><span>Orders</span><span className="mystore-menu-arrow">{openOrders ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</span></button>
            {openOrders && <div className="mystore-submenu"><button className={`mystore-submenu-item ${location.pathname === "/mystore/orders" ? "active" : ""}`} onClick={() => goTo("/mystore/orders")}><ShoppingCart size={16} /><span>All Orders</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/orders/get" ? "active" : ""}`} onClick={() => goTo("/mystore/orders/get")}><Search size={16} /><span>Get Order</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/orders/cancel" ? "active" : ""}`} onClick={() => goTo("/mystore/orders/cancel")}><XCircle size={16} /><span>Cancel Order</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/orders/fulfillment" ? "active" : ""}`} onClick={() => goTo("/mystore/orders/fulfillment")}><Truck size={16} /><span>Update Fulfillment</span></button></div>}
          </div>

          <div className="mystore-menu-group">
            <button className="mystore-menu-item group" onClick={() => setOpenProducts(!openProducts)}><Package size={19} /><span>Products</span><span className="mystore-menu-arrow">{openProducts ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</span></button>
            {openProducts && <div className="mystore-submenu"><button className={`mystore-submenu-item ${location.pathname === "/mystore/products" ? "active" : ""}`} onClick={() => goTo("/mystore/products")}><Package size={16} /><span>All Products</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/products/filter" ? "active" : ""}`} onClick={() => goTo("/mystore/products/filter")}><Filter size={16} /><span>Filter Products</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/products/get" ? "active" : ""}`} onClick={() => goTo("/mystore/products/get")}><Search size={16} /><span>Get Product</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/products/create" ? "active" : ""}`} onClick={() => goTo("/mystore/products/create")}><Plus size={16} /><span>Add Product</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/products/edit" ? "active" : ""}`} onClick={() => goTo("/mystore/products/edit")}><Edit size={16} /><span>Edit Product</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/products/delete" ? "active" : ""}`} onClick={() => goTo("/mystore/products/delete")}><Trash2 size={16} /><span>Delete Product</span></button></div>}
          </div>

          <div className="mystore-menu-group">
            <button className="mystore-menu-item group" onClick={() => setOpenInventory(!openInventory)}><Boxes size={19} /><span>Inventory</span><span className="mystore-menu-arrow">{openInventory ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</span></button>
            {openInventory && <div className="mystore-submenu"><button className={`mystore-submenu-item ${location.pathname === "/mystore/inventory/product" ? "active" : ""}`} onClick={() => goTo("/mystore/inventory/product")}><Hash size={16} /><span>Adjust by Product ID</span></button><button className={`mystore-submenu-item ${location.pathname === "/mystore/inventory/sku" ? "active" : ""}`} onClick={() => goTo("/mystore/inventory/sku")}><Boxes size={16} /><span>Adjust by SKU</span></button></div>}
          </div>
        </div>
      </aside>

      {mobileSidebar && <div className="mystore-sidebar-overlay" onClick={() => setMobileSidebar(false)} />}

      <main className="mystore-main">
        <div className="mystore-topbar-mobile">
          <button className="mystore-mobile-menu" onClick={() => setMobileSidebar(true)}><Menu size={23} /></button>
        </div>
        <Outlet /> {/* THIS RENDERS SELLERS / CUSTOMERS / ORDERS INSIDE */}
      </main>
    </div>
  );
};

export default MyStoreLayout;