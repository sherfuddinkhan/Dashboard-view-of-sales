import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Truck,
  XCircle,
  Hash,
  Menu,
  X,
} from "lucide-react";

import "./MyStoreDashboard.css";

const NODE_API = "http://localhost:5000/api";

const MyStoreDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [error, setError] = useState("");

  const [openOrders, setOpenOrders] = useState(true);
  const [openProducts, setOpenProducts] = useState(true);
  const [openInventory, setOpenInventory] = useState(true);

  const [mobileSidebar, setMobileSidebar] = useState(false);

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setError("");

      const response = await axios.get(
        `${NODE_API}/mystore/orders`
      );

      const data = response?.data?.data;

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("MyStore Orders Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load MyStore orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setError("");

      const response = await axios.get(
        `${NODE_API}/mystore/products`
      );

      const data = response?.data?.data;

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("MyStore Products Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load MyStore products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = () => {
    fetchOrders();
    fetchProducts();
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) =>
        String(order?.status || "").toLowerCase() ===
        "pending"
    ).length;

    const cancelledOrders = orders.filter(
      (order) =>
        String(order?.status || "").toLowerCase() ===
        "cancelled"
    ).length;

    const deliveredOrders = orders.filter(
      (order) =>
        String(
          order?.fulfillment_status || ""
        ).toLowerCase() === "delivered"
    ).length;

    const totalProducts = products.length;

    const publishedProducts = products.filter(
      (product) =>
        String(product?.publish) === "1" ||
        product?.publish === true
    ).length;

    const inventoryQuantity = products.reduce(
      (total, product) =>
        total +
        Number(
          product?.inventory_quantity || 0
        ),
      0
    );

    return {
      totalOrders,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
      totalProducts,
      publishedProducts,
      inventoryQuantity,
    };
  }, [orders, products]);

  // ============================================================
  // RECENT ORDERS
  // ============================================================

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a?.order_date || 0
        ).getTime();

        const dateB = new Date(
          b?.order_date || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [orders]);

  // ============================================================
  // RECENT PRODUCTS
  // ============================================================

  const recentProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatPrice = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "delivered") {
      return "status-success";
    }

    if (
      value === "cancelled" ||
      value === "returned"
    ) {
      return "status-danger";
    }

    if (
      value === "shipped" ||
      value === "in transit" ||
      value === "out for delivery"
    ) {
      return "status-info";
    }

    if (value === "pending") {
      return "status-warning";
    }

    return "status-default";
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goTo = (path) => {
    navigate(path);
    setMobileSidebar(false);
  };

  // ============================================================
  // ACTIVE ROUTE
  // ============================================================

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  // ============================================================
  // SIDEBAR
  // ============================================================

  const Sidebar = () => (
    <aside
      className={`mystore-sidebar ${
        mobileSidebar
          ? "mystore-sidebar-mobile-open"
          : ""
      }`}
    >
      {/* SIDEBAR HEADER */}

      <div className="mystore-sidebar-header">

        <div className="mystore-brand">

          <div className="mystore-brand-icon">
            <Package size={25} />
          </div>

          <div>
            <div className="mystore-brand-title">
              MyStore
            </div>

            <div className="mystore-brand-subtitle">
              API Management
            </div>
          </div>

        </div>

        <button
          className="mystore-mobile-close"
          onClick={() =>
            setMobileSidebar(false)
          }
        >
          <X size={21} />
        </button>

      </div>

      {/* SIDEBAR CONTENT */}

      <div className="mystore-sidebar-content">

        {/* DASHBOARD */}

        <button
          className={`mystore-menu-item ${
            location.pathname === "/mystore"
              ? "active"
              : ""
          }`}
          onClick={() =>
            goTo("/mystore")
          }
        >
          <LayoutDashboard size={19} />

          <span>
            Dashboard
          </span>
        </button>

        {/* ======================================================
            ORDERS
        ======================================================= */}

        <div className="mystore-menu-group">

          <button
            className="mystore-menu-item group"
            onClick={() =>
              setOpenOrders(
                !openOrders
              )
            }
          >
            <ShoppingCart size={19} />

            <span>
              Orders
            </span>

            <span className="mystore-menu-arrow">
              {openOrders ? (
                <ChevronDown size={17} />
              ) : (
                <ChevronRight size={17} />
              )}
            </span>
          </button>

          {openOrders && (
            <div className="mystore-submenu">

              <button
                className={
                  `mystore-submenu-item ${
                    isActive(
                      "/mystore/orders"
                    ) &&
                    location.pathname ===
                      "/mystore/orders"
                      ? "active"
                      : ""
                  }`
                }
                onClick={() =>
                  goTo(
                    "/mystore/orders"
                  )
                }
              >
                <ShoppingCart size={16} />
                <span>
                  All Orders
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/orders/get"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/orders/get"
                  )
                }
              >
                <Search size={16} />
                <span>
                  Get Order
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/orders/cancel"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/orders/cancel"
                  )
                }
              >
                <XCircle size={16} />
                <span>
                  Cancel Order
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/orders/fulfillment"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/orders/fulfillment"
                  )
                }
              >
                <Truck size={16} />
                <span>
                  Update Fulfillment
                </span>
              </button>

            </div>
          )}

        </div>

        {/* ======================================================
            PRODUCTS
        ======================================================= */}

        <div className="mystore-menu-group">

          <button
            className="mystore-menu-item group"
            onClick={() =>
              setOpenProducts(
                !openProducts
              )
            }
          >
            <Package size={19} />

            <span>
              Products
            </span>

            <span className="mystore-menu-arrow">
              {openProducts ? (
                <ChevronDown size={17} />
              ) : (
                <ChevronRight size={17} />
              )}
            </span>
          </button>

          {openProducts && (
            <div className="mystore-submenu">

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products"
                  )
                }
              >
                <Package size={16} />
                <span>
                  All Products
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products/filter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products/filter"
                  )
                }
              >
                <Filter size={16} />
                <span>
                  Filter Products
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products/get"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products/get"
                  )
                }
              >
                <Search size={16} />
                <span>
                  Get Product
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products/create"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products/create"
                  )
                }
              >
                <Plus size={16} />
                <span>
                  Add Product
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products/edit"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products/edit"
                  )
                }
              >
                <Edit size={16} />
                <span>
                  Edit Product
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/products/delete"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/products/delete"
                  )
                }
              >
                <Trash2 size={16} />
                <span>
                  Delete Product
                </span>
              </button>

            </div>
          )}

        </div>

        {/* ======================================================
            INVENTORY
        ======================================================= */}

        <div className="mystore-menu-group">

          <button
            className="mystore-menu-item group"
            onClick={() =>
              setOpenInventory(
                !openInventory
              )
            }
          >
            <Boxes size={19} />

            <span>
              Inventory
            </span>

            <span className="mystore-menu-arrow">
              {openInventory ? (
                <ChevronDown size={17} />
              ) : (
                <ChevronRight size={17} />
              )}
            </span>
          </button>

          {openInventory && (
            <div className="mystore-submenu">

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/inventory/product"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/inventory/product"
                  )
                }
              >
                <Hash size={16} />
                <span>
                  Adjust by Product ID
                </span>
              </button>

              <button
                className={`mystore-submenu-item ${
                  location.pathname ===
                  "/mystore/inventory/sku"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  goTo(
                    "/mystore/inventory/sku"
                  )
                }
              >
                <Boxes size={16} />
                <span>
                  Adjust by SKU
                </span>
              </button>

            </div>
          )}

        </div>

      </div>

    </aside>
  );

  // ============================================================
  // STAT CARD
  // ============================================================

  const StatCard = ({
    title,
    value,
    icon,
    className = "",
  }) => (
    <div
      className={`mystore-stat-card ${className}`}
    >
      <div className="mystore-stat-content">

        <div className="mystore-stat-title">
          {title}
        </div>

        <div className="mystore-stat-value">
          {value}
        </div>

      </div>

      <div className="mystore-stat-icon">
        {icon}
      </div>
    </div>
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mystore-layout">

      {/* ========================================================
          SIDEBAR
      ========================================================= */}

      <Sidebar />

      {/* MOBILE OVERLAY */}

      {mobileSidebar && (
        <div
          className="mystore-sidebar-overlay"
          onClick={() =>
            setMobileSidebar(false)
          }
        />
      )}

      {/* ========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="mystore-main">

        {/* TOP BAR */}

        <div className="mystore-topbar">

          <button
            className="mystore-mobile-menu"
            onClick={() =>
              setMobileSidebar(true)
            }
          >
            <Menu size={23} />
          </button>

          <div>

            <h1>
              MyStore Dashboard
            </h1>

            <p>
              Manage your MyStore APIs,
              orders, products and inventory.
            </p>

          </div>

          <button
            className="mystore-refresh-button"
            onClick={loadDashboard}
            disabled={
              ordersLoading ||
              productsLoading
            }
          >
            <RefreshCw
              size={17}
              className={
                ordersLoading ||
                productsLoading
                  ? "mystore-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mystore-error">
            {error}

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* ======================================================
            ORDER STATISTICS
        ======================================================= */}

        <section className="mystore-section">

          <div className="mystore-section-title">
            Order Overview
          </div>

          <div className="mystore-stat-grid">

            <StatCard
              title="Total Orders"
              value={
                ordersLoading
                  ? "..."
                  : statistics.totalOrders
              }
              icon={
                <ShoppingCart size={25} />
              }
            />

            <StatCard
              title="Pending Orders"
              value={
                ordersLoading
                  ? "..."
                  : statistics.pendingOrders
              }
              icon={
                <ShoppingCart size={25} />
              }
            />

            <StatCard
              title="Delivered Orders"
              value={
                ordersLoading
                  ? "..."
                  : statistics.deliveredOrders
              }
              icon={
                <Truck size={25} />
              }
            />

            <StatCard
              title="Cancelled Orders"
              value={
                ordersLoading
                  ? "..."
                  : statistics.cancelledOrders
              }
              icon={
                <XCircle size={25} />
              }
            />

          </div>

        </section>

        {/* ======================================================
            PRODUCT STATISTICS
        ======================================================= */}

        <section className="mystore-section">

          <div className="mystore-section-title">
            Product Overview
          </div>

          <div className="mystore-stat-grid">

            <StatCard
              title="Total Products"
              value={
                productsLoading
                  ? "..."
                  : statistics.totalProducts
              }
              icon={
                <Package size={25} />
              }
            />

            <StatCard
              title="Published Products"
              value={
                productsLoading
                  ? "..."
                  : statistics.publishedProducts
              }
              icon={
                <Package size={25} />
              }
            />

            <StatCard
              title="Inventory Quantity"
              value={
                productsLoading
                  ? "..."
                  : statistics.inventoryQuantity
              }
              icon={
                <Boxes size={25} />
              }
            />

          </div>

        </section>

        {/* ======================================================
            RECENT DATA
        ======================================================= */}

        <div className="mystore-content-grid">

          {/* RECENT ORDERS */}

          <section className="mystore-panel">

            <div className="mystore-panel-header">

              <div>
                <h2>
                  Recent Orders
                </h2>

                <p>
                  Latest orders from MyStore
                </p>
              </div>

              <button
                onClick={() =>
                  goTo(
                    "/mystore/orders"
                  )
                }
              >
                View All
              </button>

            </div>

            <div className="mystore-table-wrapper">

              <table className="mystore-table">

                <thead>
                  <tr>
                    <th>
                      Order ID
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {ordersLoading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="mystore-empty"
                      >
                        Loading orders...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="mystore-empty"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map(
                      (order, index) => (
                        <tr
                          key={
                            order?._id ||
                            index
                          }
                          onClick={() =>
                            goTo(
                              `/mystore/orders/get?id=${
                                order?._id || ""
                              }`
                            )
                          }
                        >

                          <td>
                            <strong>
                              {order?.order_id ||
                                order?._id ||
                                "-"}
                            </strong>
                          </td>

                          <td>
                            {formatDate(
                              order?.order_date
                            )}
                          </td>

                          <td>
                            <span
                              className={`mystore-status ${getStatusClass(
                                order?.status
                              )}`}
                            >
                              {order?.status ||
                                "Unknown"}
                            </span>
                          </td>

                          <td>
                            {formatPrice(
                              order?.total
                            )}
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* RECENT PRODUCTS */}

          <section className="mystore-panel">

            <div className="mystore-panel-header">

              <div>
                <h2>
                  Products
                </h2>

                <p>
                  Products available in MyStore
                </p>
              </div>

              <button
                onClick={() =>
                  goTo(
                    "/mystore/products"
                  )
                }
              >
                View All
              </button>

            </div>

            <div className="mystore-table-wrapper">

              <table className="mystore-table">

                <thead>
                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      Price
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {productsLoading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="mystore-empty"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : recentProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="mystore-empty"
                      >
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    recentProducts.map(
                      (
                        product,
                        index
                      ) => (
                        <tr
                          key={
                            product?._id ||
                            index
                          }
                          onClick={() =>
                            goTo(
                              `/mystore/products/get?id=${
                                product?._id || ""
                              }`
                            )
                          }
                        >

                          <td>
                            <strong>
                              {product?.name ||
                                "-"}
                            </strong>
                          </td>

                          <td>
                            {product?.sku ||
                              "-"}
                          </td>

                          <td>
                            {formatPrice(
                              product?.price
                            )}
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default MyStoreDashboard;




