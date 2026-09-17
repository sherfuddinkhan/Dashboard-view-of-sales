import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

// ============================================================
// AMAZON IMPORTS
// ============================================================

// Authorization
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator";

// Orders
import Orders from "./components/Amazon/Orders APIs/Orders";
import GetOrder from "./components/Amazon/Orders APIs/GetOrder";
import GetOrderItems from "./components/Amazon/Orders APIs/GetOrderItems";

// Catalog
import CatalogSearch from "./components/Amazon/Catalog APIs/CatalogSearch";
import CatalogItem from "./components/Amazon/Catalog APIs/CatalogItem";

// Data Kiosk
import CreateQuery from "./components/Amazon/Data Kiosk/CreateQuery";
import GetQuery from "./components/Amazon/Data Kiosk/GetQuery";
import GetDocument from "./components/Amazon/Data Kiosk/GetDocument";

// Fulfillment
import FBAOutbound from "./components/Amazon/Fulfillment APIs/FBAOutbound";

// ============================================================
// FLIPKART IMPORTS
// ============================================================

import ListingsCommonV3Api from "./components/Flipkart/Catalog APIs/ListingsCommonV3Api.js";
import FlipkartProducts from "./components/Flipkart/Products/FlipkartProducts.jsx";
import FlipkartInventoryFBF from "./components/Flipkart/Inventory APIs/FlipkartInventoryFBF.jsx";
import FlipkartPricing from "./components/Flipkart/Pricing/FlipkartPricing.jsx";
import FlipkartOrders from "./components/Flipkart/Orders APIs/FlipkartOrders.jsx";
import FlipkartShipments from "./components/Flipkart/Shipment V3/FlipkartShipments.jsx";
import FlipkartReturns from "./components/Flipkart/Returns/FlipkartReturns.jsx";
import FlipkartReports from "./components/Flipkart/Reports APIs/FlipkartReports.jsx";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard.jsx";

// ============================================================
// MYSTORE IMPORTS
// ============================================================

import MyStoreDashboard from "./components/MyStore/MyStoreDashboard.jsx";

import ListAllOrders from "./components/MyStore/ListAllOrders.jsx";
import GetOrderMyStore from "./components/MyStore/GetOrder.jsx";
import CancelOrder from "./components/MyStore/CancelOrder.jsx";

import ListProducts from "./components/MyStore/ListProducts.jsx";
import GetProduct from "./components/MyStore/GetProduct.jsx";
import AddProduct from "./components/MyStore/AddProduct.jsx";
import EditProduct from "./components/MyStore/EditProduct.jsx";
import DeleteProduct from "./components/MyStore/DeleteProduct.jsx";
import FilterProducts from "./components/MyStore/FilterProducts.jsx";

import AdjustInventoryByProductId from "./components/MyStore/AdjustInventoryByProductId.jsx";
import AdjustInventoryBySku from "./components/MyStore/AdjustInventoryBySku.jsx";

// ============================================================
// GLOBAL STYLES
// ============================================================

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
};

const contentStyle = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto",
};

// ============================================================
// DUMMY AMAZON COMPONENT
// ============================================================

const DummyAmazon = ({ title, path }) => {
  return (
    <div style={contentStyle}>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "15px",
            color: "#111827",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "10px",
          }}
        >
          Amazon SP-API Endpoint
        </p>

        <code
          style={{
            display: "block",
            background: "#f3f4f6",
            padding: "14px",
            borderRadius: "8px",
            overflowX: "auto",
            color: "#111827",
          }}
        >
          {path}
        </code>

        <p
          style={{
            marginTop: "20px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Backend API is available through server.js. A dedicated React UI
          component can be added here when required.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// LOGOUT
// ============================================================

const logoutUser = (navigate) => {
  localStorage.clear();
  sessionStorage.clear();

  navigate("/marketplaces", {
    replace: true,
  });

  window.location.reload();
};

// ============================================================
// MARKETPLACE SELECTOR
// ============================================================

const MarketplaceSelector = () => {
  const navigate = useNavigate();

  const marketplaces = [
    {
      id: "AMZ",
      name: "Amazon",
      description: "40 Amazon SP-APIs",
      path: "/marketplaces/amazon",
      background: "#111827",
    },
    {
      id: "FLP",
      name: "Flipkart",
      description: "9 Flipkart Seller APIs",
      path: "/marketplaces/flipkart",
      background: "#2874f0",
    },
    {
      id: "MYS",
      name: "MyStore",
      description: "12 StoreHippo APIs",
      path: "/mystore",
      background: "#673ab7",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "45px",
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Marketplace Seller Portal
            </h1>

            <p
              style={{
                marginTop: "12px",
                fontSize: "17px",
                color: "#6b7280",
              }}
            >
              Amazon + Flipkart + MyStore Connected
            </p>
          </div>

          <button
            onClick={() => logoutUser(navigate)}
            style={{
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>

        {/* Marketplace Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {marketplaces.map((marketplace) => (
            <Link
              key={marketplace.id}
              to={marketplace.path}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "30px",
                  minHeight: "230px",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div
                  style={{
                    width: "65px",
                    height: "65px",
                    borderRadius: "14px",
                    background: marketplace.background,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    marginBottom: "22px",
                  }}
                >
                  {marketplace.id}
                </div>

                <h2
                  style={{
                    margin: "0 0 10px",
                    color: "#111827",
                  }}
                >
                  {marketplace.name}
                </h2>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  {marketplace.description}
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    fontWeight: "600",
                    color: "#2563eb",
                  }}
                >
                  Open →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMMON SIDEBAR LAYOUT
// ============================================================

const SidebarLayout = ({
  title,
  subtitle,
  menu = [],
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <aside
        style={{
          width: "260px",
          background: "#111827",
          color: "#ffffff",
          minHeight: "100vh",
          padding: "20px 14px",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          zIndex: 1000,
        }}
      >
        {/* Sidebar Content */}
        <div>
          {/* Header */}
          <div
            style={{
              padding: "10px 12px 25px",
              borderBottom: "1px solid #374151",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "21px",
                fontWeight: "700",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "5px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Marketplace Selector */}
          <Link
            to="/marketplaces"
            style={{
              display: "block",
              padding: "10px 14px",
              marginBottom: "15px",
              color: "#d1d5db",
              textDecoration: "none",
              fontSize: "13px",
              borderRadius: "7px",
            }}
          >
            ← Marketplace Selector
          </Link>

          {/* Menu */}
          {menu.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  padding: "18px 14px 6px",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                {section.title}
              </div>

              {section.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    marginBottom: "3px",
                    borderRadius: "7px",
                    textDecoration: "none",
                    color: "#ffffff",
                    background: isActive(link.to)
                      ? "#374151"
                      : "transparent",
                    fontSize: "13px",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid #374151",
          }}
        >
          <button
            onClick={() => logoutUser(navigate)}
            style={{
              width: "100%",
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              padding: "11px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
};

// ============================================================
// AMAZON MENU
// ============================================================

const amazonMenu = [
  {
    title: "AUTH",
    links: [
      {
        to: "/marketplaces/amazon/auth/token",
        label: "🔑 Token Generator",
      },
      {
        to: "/marketplaces/amazon/sellers",
        label: "🏪 Sellers",
      },
      {
        to: "/marketplaces/amazon/tokens",
        label: "🎫 Restricted Token",
      },
    ],
  },

  {
    title: "ORDERS",
    links: [
      {
        to: "/marketplaces/amazon/orders/list",
        label: "📦 List Orders",
      },
      {
        to: "/marketplaces/amazon/orders/get",
        label: "🔍 Get Order",
      },
      {
        to: "/marketplaces/amazon/orders/get-items",
        label: "📋 Get Order Items",
      },
    ],
  },

  {
    title: "CATALOG",
    links: [
      {
        to: "/marketplaces/amazon/catalog/search",
        label: "🔎 Catalog Search",
      },
      {
        to: "/marketplaces/amazon/catalog/item",
        label: "📄 Catalog Item",
      },
      {
        to: "/marketplaces/amazon/product-types",
        label: "📑 Product Types",
      },
      {
        to: "/marketplaces/amazon/listings/restrictions",
        label: "🚫 Restrictions",
      },
    ],
  },

  {
    title: "LISTINGS",
    links: [
      {
        to: "/marketplaces/amazon/listings/put",
        label: "➕ Put Listings",
      },
      {
        to: "/marketplaces/amazon/listings/get",
        label: "📄 Get Listings",
      },
      {
        to: "/marketplaces/amazon/listings/delete",
        label: "🗑️ Delete Listings",
      },
    ],
  },

  {
    title: "PRICING & FEES",
    links: [
      {
        to: "/marketplaces/amazon/pricing/v0",
        label: "💲 Pricing v0",
      },
      {
        to: "/marketplaces/amazon/pricing/2022",
        label: "💲 Pricing 2022",
      },
      {
        to: "/marketplaces/amazon/fees",
        label: "💰 Fees Estimate",
      },
    ],
  },

  {
    title: "FBA & FULFILLMENT",
    links: [
      {
        to: "/marketplaces/amazon/fba/inventory",
        label: "📦 FBA Inventory",
      },
      {
        to: "/marketplaces/amazon/fba/inbound",
        label: "📥 FBA Inbound",
      },
      {
        to: "/marketplaces/amazon/fulfillment/outbound",
        label: "🚚 FBA Outbound",
      },
      {
        to: "/marketplaces/amazon/mfn",
        label: "📮 MFN Eligibility",
      },
      {
        to: "/marketplaces/amazon/easyship",
        label: "⚡ EasyShip",
      },
    ],
  },

  {
    title: "REPORTS & FINANCES",
    links: [
      {
        to: "/marketplaces/amazon/reports/create",
        label: "📊 Create Report",
      },
      {
        to: "/marketplaces/amazon/reports/get",
        label: "📄 Get Report",
      },
      {
        to: "/marketplaces/amazon/finances",
        label: "💵 Finances",
      },
      {
        to: "/marketplaces/amazon/sales",
        label: "📈 Sales Metrics",
      },
      {
        to: "/marketplaces/amazon/invoices",
        label: "🧾 Invoices",
      },
    ],
  },

  {
    title: "FEEDS & UPLOADS",
    links: [
      {
        to: "/marketplaces/amazon/feeds/document",
        label: "📄 Feed Document",
      },
      {
        to: "/marketplaces/amazon/feeds/create",
        label: "➕ Create Feed",
      },
      {
        to: "/marketplaces/amazon/feeds/get",
        label: "📋 Get Feed",
      },
      {
        to: "/marketplaces/amazon/uploads",
        label: "☁️ Uploads",
      },
    ],
  },

  {
    title: "MESSAGING & NOTIFICATIONS",
    links: [
      {
        to: "/marketplaces/amazon/messaging",
        label: "💬 Messaging",
      },
      {
        to: "/marketplaces/amazon/notifications",
        label: "🔔 Notifications",
      },
      {
        to: "/marketplaces/amazon/feedback",
        label: "⭐ Feedback",
      },
      {
        to: "/marketplaces/amazon/aplus",
        label: "✨ A+ Content",
      },
    ],
  },

  {
    title: "DATA & OTHER",
    links: [
      {
        to: "/marketplaces/amazon/data-kiosk/create-query",
        label: "➕ Create Query",
      },
      {
        to: "/marketplaces/amazon/data-kiosk/get-query",
        label: "🔍 Get Query",
      },
      {
        to: "/marketplaces/amazon/data-kiosk/get-document",
        label: "📄 Get Document",
      },
      {
        to: "/marketplaces/amazon/shipping",
        label: "🚢 Shipping",
      },
      {
        to: "/marketplaces/amazon/vendor/orders",
        label: "🏭 Vendor Orders",
      },
      {
        to: "/marketplaces/amazon/replenishment",
        label: "🔄 Replenishment",
      },
    ],
  },
];

// ============================================================
// AMAZON LAYOUT
// ============================================================

const AmazonLayout = () => {
  return (
    <SidebarLayout
      title="Amazon"
      subtitle="40 SP-APIs"
      menu={amazonMenu}
    >
      <Routes>
        {/* Default */}
        <Route
          index
          element={<Navigate to="auth/token" replace />}
        />

        {/* ====================================================
            AUTH
        ==================================================== */}

        <Route
          path="auth/token"
          element={<TokenGenerator />}
        />

        <Route
          path="sellers"
          element={
            <DummyAmazon
              title="Sellers - Marketplace Participations"
              path="/sellers/v1/marketplaceParticipations"
            />
          }
        />

        <Route
          path="tokens"
          element={
            <DummyAmazon
              title="Restricted Data Token"
              path="/tokens/2021-03-01/restrictedDataToken"
            />
          }
        />

        {/* ====================================================
            ORDERS
        ==================================================== */}

        <Route
          path="orders/list"
          element={<Orders />}
        />

        <Route
          path="orders/get"
          element={<GetOrder />}
        />

        <Route
          path="orders/get-items"
          element={<GetOrderItems />}
        />

        {/* ====================================================
            CATALOG
        ==================================================== */}

        <Route
          path="catalog/search"
          element={<CatalogSearch />}
        />

        <Route
          path="catalog/item"
          element={<CatalogItem />}
        />

        <Route
          path="product-types"
          element={
            <DummyAmazon
              title="Product Type Definitions"
              path="/definitions/2020-09-01/productTypes"
            />
          }
        />

        <Route
          path="listings/restrictions"
          element={
            <DummyAmazon
              title="Listings Restrictions"
              path="/listings/2021-08-01/restrictions"
            />
          }
        />

        {/* ====================================================
            LISTINGS
        ==================================================== */}

        <Route
          path="listings/put"
          element={
            <DummyAmazon
              title="Put Listings"
              path="/listings/2021-08-01/items"
            />
          }
        />

        <Route
          path="listings/get"
          element={
            <DummyAmazon
              title="Get Listings"
              path="/listings/2021-08-01/items/{sellerId}/{sku}"
            />
          }
        />

        <Route
          path="listings/delete"
          element={
            <DummyAmazon
              title="Delete Listings"
              path="/listings/2021-08-01/items/{sellerId}/{sku}"
            />
          }
        />

        {/* ====================================================
            PRICING & FEES
        ==================================================== */}

        <Route
          path="pricing/v0"
          element={
            <DummyAmazon
              title="Product Pricing v0"
              path="/products/pricing/v0/price"
            />
          }
        />

        <Route
          path="pricing/2022"
          element={
            <DummyAmazon
              title="Product Pricing 2022"
              path="/products/pricing/2022-05-01/items"
            />
          }
        />

        <Route
          path="fees"
          element={
            <DummyAmazon
              title="Fees Estimate"
              path="/products/fees/v0/feesEstimate"
            />
          }
        />

        {/* ====================================================
            FBA & FULFILLMENT
        ==================================================== */}

        <Route
          path="fba/inventory"
          element={
            <DummyAmazon
              title="FBA Inventory"
              path="/fba/inventory/v1/summaries"
            />
          }
        />

        <Route
          path="fba/inbound"
          element={
            <DummyAmazon
              title="FBA Inbound"
              path="/fba/inbound/v1/eligibility"
            />
          }
        />

        <Route
          path="fulfillment/outbound"
          element={<FBAOutbound />}
        />

        <Route
          path="mfn"
          element={
            <DummyAmazon
              title="Merchant Fulfillment"
              path="/mfn/v0/eligibleShippingServices"
            />
          }
        />

        <Route
          path="easyship"
          element={
            <DummyAmazon
              title="EasyShip"
              path="/easyShip/2022-03-23/timeSlot"
            />
          }
        />

        {/* ====================================================
            REPORTS & FINANCES
        ==================================================== */}

        <Route
          path="reports/create"
          element={
            <DummyAmazon
              title="Create Report"
              path="/reports/2021-06-30/reports"
            />
          }
        />

        <Route
          path="reports/get"
          element={
            <DummyAmazon
              title="Get Report"
              path="/reports/2021-06-30/reports/{id}"
            />
          }
        />

        <Route
          path="finances"
          element={
            <DummyAmazon
              title="Finances"
              path="/finances/v0/financialEvents"
            />
          }
        />

        <Route
          path="sales"
          element={
            <DummyAmazon
              title="Sales Metrics"
              path="/sales/v1/orderMetrics"
            />
          }
        />

        <Route
          path="invoices"
          element={
            <DummyAmazon
              title="Invoices"
              path="/tax/invoices/2024-06-19/invoices"
            />
          }
        />

        {/* ====================================================
            FEEDS & UPLOADS
        ==================================================== */}

        <Route
          path="feeds/document"
          element={
            <DummyAmazon
              title="Feed Document"
              path="/feeds/2021-06-30/documents"
            />
          }
        />

        <Route
          path="feeds/create"
          element={
            <DummyAmazon
              title="Create Feed"
              path="/feeds/2021-06-30/feeds"
            />
          }
        />

        <Route
          path="feeds/get"
          element={
            <DummyAmazon
              title="Get Feed"
              path="/feeds/2021-06-30/feeds/{id}"
            />
          }
        />

        <Route
          path="uploads"
          element={
            <DummyAmazon
              title="Uploads"
              path="/uploads/2020-11-01/uploadDestinations"
            />
          }
        />

        {/* ====================================================
            MESSAGING & NOTIFICATIONS
        ==================================================== */}

        <Route
          path="messaging"
          element={
            <DummyAmazon
              title="Messaging"
              path="/messaging/v1/orders/{orderId}"
            />
          }
        />

        <Route
          path="notifications"
          element={
            <DummyAmazon
              title="Notifications"
              path="/notifications/v1/destinations"
            />
          }
        />

        <Route
          path="feedback"
          element={
            <DummyAmazon
              title="Customer Feedback"
              path="/customerFeedback/2024-06-01/items"
            />
          }
        />

        <Route
          path="aplus"
          element={
            <DummyAmazon
              title="A+ Content"
              path="/aplus/2020-11-01/contentDocuments"
            />
          }
        />

        {/* ====================================================
            DATA KIOSK
        ==================================================== */}

        <Route
          path="data-kiosk/create-query"
          element={<CreateQuery />}
        />

        <Route
          path="data-kiosk/get-query"
          element={<GetQuery />}
        />

        <Route
          path="data-kiosk/get-document"
          element={<GetDocument />}
        />

        {/* ====================================================
            OTHER
        ==================================================== */}

        <Route
          path="shipping"
          element={
            <DummyAmazon
              title="Shipping API"
              path="/shipping/v1/shipments/rates"
            />
          }
        />

        <Route
          path="vendor/orders"
          element={
            <DummyAmazon
              title="Vendor Orders"
              path="/vendor/orders/v1/purchaseOrders"
            />
          }
        />

        <Route
          path="replenishment"
          element={
            <DummyAmazon
              title="Replenishment"
              path="/replenishment/2022-11-07/offers"
            />
          }
        />
      </Routes>
    </SidebarLayout>
  );
};

// ============================================================
// FLIPKART MENU
// ============================================================

const flipkartMenu = [
  {
    title: "DASHBOARD",
    links: [
      {
        to: "/marketplaces/flipkart",
        label: "📊 Dashboard",
      },
    ],
  },

  {
    title: "CATALOG",
    links: [
      {
        to: "/marketplaces/flipkart/catalog",
        label: "📦 Catalog APIs",
      },
      {
        to: "/marketplaces/flipkart/products",
        label: "📋 Products",
      },
    ],
  },

  {
    title: "INVENTORY & PRICING",
    links: [
      {
        to: "/marketplaces/flipkart/inventory",
        label: "📊 Inventory APIs",
      },
      {
        to: "/marketplaces/flipkart/pricing",
        label: "💰 Pricing",
      },
    ],
  },

  {
    title: "ORDERS",
    links: [
      {
        to: "/marketplaces/flipkart/orders",
        label: "🛒 Orders APIs",
      },
      {
        to: "/marketplaces/flipkart/shipment",
        label: "🚚 Shipment V3",
      },
      {
        to: "/marketplaces/flipkart/returns",
        label: "↩️ Returns",
      },
    ],
  },

  {
    title: "REPORTS",
    links: [
      {
        to: "/marketplaces/flipkart/reports",
        label: "📈 Reports APIs",
      },
    ],
  },
];

// ============================================================
// FLIPKART LAYOUT
// ============================================================

const FlipkartLayout = () => {
  return (
    <SidebarLayout
      title="Flipkart"
      subtitle="Seller APIs"
      menu={flipkartMenu}
    >
      <Routes>
        <Route
          index
          element={<FlipkartDashboard />}
        />

        <Route
          path="catalog"
          element={<ListingsCommonV3Api />}
        />

        <Route
          path="products"
          element={<FlipkartProducts />}
        />

        <Route
          path="inventory"
          element={<FlipkartInventoryFBF />}
        />

        <Route
          path="pricing"
          element={<FlipkartPricing />}
        />

        <Route
          path="orders"
          element={<FlipkartOrders />}
        />

        <Route
          path="shipment"
          element={<FlipkartShipments />}
        />

        <Route
          path="returns"
          element={<FlipkartReturns />}
        />

        <Route
          path="reports"
          element={<FlipkartReports />}
        />
      </Routes>
    </SidebarLayout>
  );
};

// ============================================================
// MYSTORE MENU
// ============================================================

const myStoreMenu = [
  {
    title: "DASHBOARD",
    links: [
      {
        to: "/mystore",
        label: "📊 Dashboard",
      },
    ],
  },

  {
    title: "ORDERS",
    links: [
      {
        to: "/mystore/orders",
        label: "📦 List All Orders",
      },
      {
        to: "/mystore/orders/get",
        label: "🔍 Get Order",
      },
      {
        to: "/mystore/orders/cancel",
        label: "❌ Cancel Order",
      },
    ],
  },

  {
    title: "PRODUCTS",
    links: [
      {
        to: "/mystore/products",
        label: "📋 List Products",
      },
      {
        to: "/mystore/products/get",
        label: "🔍 Get Product",
      },
      {
        to: "/mystore/products/add",
        label: "➕ Add Product",
      },
      {
        to: "/mystore/products/edit",
        label: "✏️ Edit Product",
      },
      {
        to: "/mystore/products/delete",
        label: "🗑️ Delete Product",
      },
      {
        to: "/mystore/products/filter",
        label: "🔎 Filter Products",
      },
    ],
  },

  {
    title: "INVENTORY",
    links: [
      {
        to: "/mystore/inventory/product",
        label: "📊 Adjust by Product ID",
      },
      {
        to: "/mystore/inventory/sku",
        label: "🔖 Adjust by SKU",
      },
    ],
  },
];

// ============================================================
// MYSTORE LAYOUT
// ============================================================

const MyStoreLayout = () => {
  return (
    <SidebarLayout
      title="MyStore"
      subtitle="12 StoreHippo APIs"
      menu={myStoreMenu}
    >
      <Routes>
        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        <Route
          index
          element={<MyStoreDashboard />}
        />

        {/* ====================================================
            ORDERS
        ==================================================== */}

        <Route
          path="orders"
          element={<ListAllOrders />}
        />

        <Route
          path="orders/get"
          element={<GetOrderMyStore />}
        />

        <Route
          path="orders/cancel"
          element={<CancelOrder />}
        />

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <Route
          path="products"
          element={<ListProducts />}
        />

        <Route
          path="products/get"
          element={<GetProduct />}
        />

        <Route
          path="products/add"
          element={<AddProduct />}
        />

        <Route
          path="products/edit"
          element={<EditProduct />}
        />

        <Route
          path="products/delete"
          element={<DeleteProduct />}
        />

        <Route
          path="products/filter"
          element={<FilterProducts />}
        />

        {/* ====================================================
            INVENTORY
        ==================================================== */}

        <Route
          path="inventory/product"
          element={<AdjustInventoryByProductId />}
        />

        <Route
          path="inventory/sku"
          element={<AdjustInventoryBySku />}
        />
      </Routes>
    </SidebarLayout>
  );
};

// ============================================================
// APPLICATION ROUTES
// ============================================================

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            MARKETPLACE SELECTOR
        ================================================== */}

        <Route
          path="/"
          element={<MarketplaceSelector />}
        />

        <Route
          path="/marketplaces"
          element={<MarketplaceSelector />}
        />

        {/* ==================================================
            AMAZON
        ================================================== */}

        <Route
          path="/marketplaces/amazon/*"
          element={<AmazonLayout />}
        />

        {/* ==================================================
            FLIPKART
        ================================================== */}

        <Route
          path="/marketplaces/flipkart/*"
          element={<FlipkartLayout />}
        />

        {/* ==================================================
            MYSTORE
        ================================================== */}

        <Route
          path="/mystore/*"
          element={<MyStoreLayout />}
        />

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/marketplaces"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
