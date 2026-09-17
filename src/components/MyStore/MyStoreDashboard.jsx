import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  Package,
  Boxes,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";

import "./MyStoreDashboard.css";

const NODE_API = "http://localhost:5000/api";

/* =========================================================
   HELPERS
========================================================= */

const getApiError = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage
  );
};

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
  const value = String(status || "").toLowerCase();

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

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  icon,
  className = "",
}) => {
  return (
    <div className={`mystore-stat-card ${className}`}>
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
};

/* =========================================================
   RECENT ORDERS TABLE
========================================================= */

const RecentOrders = ({
  orders,
  loading,
  onViewAll,
  onOrderClick,
}) => {
  return (
    <section className="mystore-panel">
      <div className="mystore-panel-header">
        <div>
          <h2>Recent Orders</h2>

          <p>
            Latest orders from MyStore
          </p>
        </div>

        <button onClick={onViewAll}>
          View All
        </button>
      </div>

      <div className="mystore-table-wrapper">
        <table className="mystore-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="mystore-empty"
                >
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="mystore-empty"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const orderId =
                  order?._id ||
                  order?.order_id ||
                  index;

                return (
                  <tr
                    key={orderId}
                    onClick={() =>
                      onOrderClick(
                        order?._id
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* =========================================================
   RECENT PRODUCTS TABLE
========================================================= */

const RecentProducts = ({
  products,
  loading,
  onViewAll,
  onProductClick,
}) => {
  return (
    <section className="mystore-panel">
      <div className="mystore-panel-header">
        <div>
          <h2>Products</h2>

          <p>
            Products available in MyStore
          </p>
        </div>

        <button onClick={onViewAll}>
          View All
        </button>
      </div>

      <div className="mystore-table-wrapper">
        <table className="mystore-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="3"
                  className="mystore-empty"
                >
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="mystore-empty"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => {
                const productId =
                  product?._id ||
                  index;

                return (
                  <tr
                    key={productId}
                    onClick={() =>
                      onProductClick(
                        product?._id
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* =========================================================
   MAIN DASHBOARD
========================================================= */

const MyStoreDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [productsLoading, setProductsLoading] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FETCH ORDERS
  ======================================================= */

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setError("");

      const response = await axios.get(
        `${NODE_API}/mystore/orders`
      );

      const data =
        response?.data?.data;

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "MyStore Orders Error:",
        error
      );

      setError(
        getApiError(
          error,
          "Failed to load MyStore orders."
        )
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setError("");

      const response = await axios.get(
        `${NODE_API}/mystore/products`
      );

      const data =
        response?.data?.data;

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "MyStore Products Error:",
        error
      );

      setError(
        getApiError(
          error,
          "Failed to load MyStore products."
        )
      );
    } finally {
      setProductsLoading(false);
    }
  };

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    await Promise.all([
      fetchOrders(),
      fetchProducts(),
    ]);
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const totalOrders =
      orders.length;

    const pendingOrders =
      orders.filter(
        (order) =>
          String(
            order?.status || ""
          ).toLowerCase() ===
          "pending"
      ).length;

    const cancelledOrders =
      orders.filter(
        (order) =>
          String(
            order?.status || ""
          ).toLowerCase() ===
          "cancelled"
      ).length;

    const deliveredOrders =
      orders.filter(
        (order) =>
          String(
            order?.fulfillment_status ||
              ""
          ).toLowerCase() ===
          "delivered"
      ).length;

    const totalProducts =
      products.length;

    const publishedProducts =
      products.filter(
        (product) =>
          String(
            product?.publish
          ) === "1" ||
          product?.publish === true
      ).length;

    const inventoryQuantity =
      products.reduce(
        (total, product) =>
          total +
          Number(
            product?.inventory_quantity ||
              0
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

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a?.order_date || 0
        ).getTime();

        const dateB = new Date(
          b?.order_date || 0
        ).getTime();

        return dateA - dateB;
      })
      .slice(0, 5)
      .reverse();
  }, [orders]);

  /* =======================================================
     RECENT PRODUCTS
  ======================================================= */

  const recentProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goToOrders = () => {
    navigate("/mystore/orders");
  };

  const goToProducts = () => {
    navigate("/mystore/products");
  };

  const goToOrder = (orderId) => {
    if (!orderId) {
      navigate("/mystore/orders/get");
      return;
    }

    navigate(
      `/mystore/orders/get?id=${orderId}`
    );
  };

  const goToProduct = (productId) => {
    if (!productId) {
      navigate("/mystore/products/get");
      return;
    }

    navigate(
      `/mystore/products/get?id=${productId}`
    );
  };

  /* =======================================================
     REFRESH STATE
  ======================================================= */

  const isRefreshing =
    ordersLoading ||
    productsLoading;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mystore-dashboard">
      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="mystore-topbar">
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
          disabled={isRefreshing}
        >
          <RefreshCw
            size={17}
            className={
              isRefreshing
                ? "mystore-spin"
                : ""
            }
          />

          {isRefreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mystore-error">
          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          ORDER OVERVIEW
      ================================================= */}

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
              <ShoppingCart
                size={25}
              />
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
              <ShoppingCart
                size={25}
              />
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
              <XCircle
                size={25}
              />
            }
          />
        </div>
      </section>

      {/* =================================================
          PRODUCT OVERVIEW
      ================================================= */}

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
              <Package
                size={25}
              />
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
              <Package
                size={25}
              />
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
              <Boxes
                size={25}
              />
            }
          />
        </div>
      </section>

      {/* =================================================
          RECENT DATA
      ================================================= */}

      <div className="mystore-content-grid">
        <RecentOrders
          orders={recentOrders}
          loading={ordersLoading}
          onViewAll={goToOrders}
          onOrderClick={goToOrder}
        />

        <RecentProducts
          products={recentProducts}
          loading={productsLoading}
          onViewAll={goToProducts}
          onProductClick={goToProduct}
        />
      </div>
    </div>
  );
};

export default MyStoreDashboard;