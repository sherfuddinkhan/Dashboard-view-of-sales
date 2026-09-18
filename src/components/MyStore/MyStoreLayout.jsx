import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  ChevronDown,
  ChevronRight,
  Store,
  Search,
  Filter,
  Edit,
  Trash2,
  Truck,
  XCircle,
  Hash,
  Menu,
  X,
  Plus,
  Users,
} from "lucide-react";

import "./MyStoreLayout.css";

const MyStoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [openGroups, setOpenGroups] = useState({
    orders: true,
    products: true,
    inventory: true,
  });

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goTo = (path) => {
    navigate(path);
  };

  /* =========================================================
     ACTIVE ROUTE
  ========================================================= */

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =========================================================
     GROUP TOGGLE
  ========================================================= */

  const toggleGroup = (group) => {
    setOpenGroups((previous) => ({
      ...previous,
      [group]: !previous[group],
    }));
  };

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  const handleNavigation = (path) => {
    navigate(path);

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  return (
    <div className="mystore-layout">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="mystore-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`mystore-sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >

        {/* ===================================================
            SIDEBAR HEADER
        =================================================== */}

        <div className="mystore-sidebar-header">

          <div className="mystore-logo-section">
            <div className="mystore-logo">
              <Store size={24} />
            </div>

            {sidebarOpen && (
              <div className="mystore-logo-text">
                <h2>MyStore</h2>
                <span>API Modules</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mystore-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        {/* ===================================================
            SIDEBAR MENU
        =================================================== */}

        <div className="mystore-sidebar-content">

          {/* =================================================
              MAIN
          ================================================= */}

          {sidebarOpen && (
            <div className="mystore-section-title">
              MAIN
            </div>
          )}

          {/* Dashboard */}

          <button
            type="button"
            className={`mystore-menu-item ${
              isActive("/mystore/dashboard") ? "active" : ""
            }`}
            onClick={() =>
              handleNavigation("/mystore/dashboard")
            }
            title={!sidebarOpen ? "Dashboard" : ""}
          >
            <LayoutDashboard size={19} />

            {sidebarOpen && (
              <span>Dashboard</span>
            )}
          </button>

          {/* =================================================
              SELLER MANAGEMENT
          ================================================= */}

          {sidebarOpen && (
            <div className="mystore-section-title">
              SELLER MANAGEMENT
            </div>
          )}

          {/* Sellers */}

          <button
            type="button"
            className={`mystore-menu-item ${
              isActive("/mystore/sellers") ? "active" : ""
            }`}
            onClick={() =>
              handleNavigation("/mystore/sellers")
            }
            title={!sidebarOpen ? "Sellers" : ""}
          >
            <Store size={19} />

            {sidebarOpen && (
              <span>Sellers</span>
            )}
          </button>

          {/* Seller Customers */}

          <button
            type="button"
            className={`mystore-menu-item ${
              isActive("/mystore/seller-customers")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(
                "/mystore/seller-customers"
              )
            }
            title={!sidebarOpen ? "Seller Customers" : ""}
          >
            <Users size={19} />

            {sidebarOpen && (
              <span>Seller Customers</span>
            )}
          </button>

          {/* =================================================
              ORDERS
          ================================================= */}

          {sidebarOpen && (
            <div className="mystore-section-title">
              ORDERS
            </div>
          )}

          <div className="mystore-menu-group">

            {/* Orders Group Header */}

            <button
              type="button"
              className="mystore-menu-item group-header"
              onClick={() => toggleGroup("orders")}
              title={!sidebarOpen ? "Orders" : ""}
            >
              <ShoppingCart size={19} />

              {sidebarOpen && (
                <>
                  <span>Orders</span>

                  {openGroups.orders ? (
                    <ChevronDown
                      size={17}
                      className="group-arrow"
                    />
                  ) : (
                    <ChevronRight
                      size={17}
                      className="group-arrow"
                    />
                  )}
                </>
              )}
            </button>

            {/* Orders Children */}

            {sidebarOpen && openGroups.orders && (
              <div className="mystore-submenu">

                {/* All Orders */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive("/mystore/orders")
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/orders"
                    )
                  }
                >
                  <ShoppingCart size={16} />
                  <span>All Orders</span>
                </button>

                {/* Get Order */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive("/mystore/orders/get")
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/orders/get"
                    )
                  }
                >
                  <Hash size={16} />
                  <span>Get Order</span>
                </button>

                {/* Cancel Order */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive("/mystore/orders/cancel")
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/orders/cancel"
                    )
                  }
                >
                  <XCircle size={16} />
                  <span>Cancel Order</span>
                </button>

                {/* Update Fulfillment */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/orders/fulfillment"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/orders/fulfillment"
                    )
                  }
                >
                  <Truck size={16} />
                  <span>Update Fulfillment</span>
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {sidebarOpen && (
            <div className="mystore-section-title">
              CATALOG & PRODUCTS
            </div>
          )}

          <div className="mystore-menu-group">

            {/* Products Group Header */}

            <button
              type="button"
              className="mystore-menu-item group-header"
              onClick={() =>
                toggleGroup("products")
              }
              title={!sidebarOpen ? "Products" : ""}
            >
              <Package size={19} />

              {sidebarOpen && (
                <>
                  <span>Products</span>

                  {openGroups.products ? (
                    <ChevronDown
                      size={17}
                      className="group-arrow"
                    />
                  ) : (
                    <ChevronRight
                      size={17}
                      className="group-arrow"
                    />
                  )}
                </>
              )}
            </button>

            {/* Products Children */}

            {sidebarOpen && openGroups.products && (
              <div className="mystore-submenu">

                {/* All Products */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive("/mystore/products")
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products"
                    )
                  }
                >
                  <Package size={16} />
                  <span>All Products</span>
                </button>

                {/* Filter Products */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/products/filter"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products/filter"
                    )
                  }
                >
                  <Filter size={16} />
                  <span>Filter Products</span>
                </button>

                {/* Get Product */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/products/get"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products/get"
                    )
                  }
                >
                  <Search size={16} />
                  <span>Get Product</span>
                </button>

                {/* Add Product */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/products/create"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products/create"
                    )
                  }
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>

                {/* Edit Product */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/products/edit"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products/edit"
                    )
                  }
                >
                  <Edit size={16} />
                  <span>Edit Product</span>
                </button>

                {/* Delete Product */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/products/delete"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/products/delete"
                    )
                  }
                >
                  <Trash2 size={16} />
                  <span>Delete Product</span>
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              INVENTORY
          ================================================= */}

          {sidebarOpen && (
            <div className="mystore-section-title">
              INVENTORY
            </div>
          )}

          <div className="mystore-menu-group">

            {/* Inventory Group Header */}

            <button
              type="button"
              className="mystore-menu-item group-header"
              onClick={() =>
                toggleGroup("inventory")
              }
              title={!sidebarOpen ? "Inventory" : ""}
            >
              <Boxes size={19} />

              {sidebarOpen && (
                <>
                  <span>Inventory</span>

                  {openGroups.inventory ? (
                    <ChevronDown
                      size={17}
                      className="group-arrow"
                    />
                  ) : (
                    <ChevronRight
                      size={17}
                      className="group-arrow"
                    />
                  )}
                </>
              )}
            </button>

            {/* Inventory Children */}

            {sidebarOpen && openGroups.inventory && (
              <div className="mystore-submenu">

                {/* Adjust by Product ID */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/inventory/product"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/inventory/product"
                    )
                  }
                >
                  <Package size={16} />
                  <span>
                    Adjust by Product ID
                  </span>
                </button>

                {/* Adjust by SKU */}

                <button
                  type="button"
                  className={`mystore-submenu-item ${
                    isActive(
                      "/mystore/inventory/sku"
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      "/mystore/inventory/sku"
                    )
                  }
                >
                  <Hash size={16} />
                  <span>
                    Adjust by SKU
                  </span>
                </button>

              </div>
            )}

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className={`mystore-main ${
          sidebarOpen
            ? "main-sidebar-open"
            : "main-sidebar-closed"
        }`}
      >

        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="mystore-topbar">

          <button
            type="button"
            className="mystore-menu-toggle"
            onClick={() =>
              setSidebarOpen((previous) => !previous)
            }
            title={
              sidebarOpen
                ? "Close Sidebar"
                : "Open Sidebar"
            }
          >
            {sidebarOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

          <div className="mystore-topbar-title">
            <Store size={21} />

            <span>
              MyStore API Modules
            </span>
          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="mystore-page-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
};

export default MyStoreLayout;