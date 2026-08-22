import React, { useState, useEffect } from "react";
import { 
  BarChart3, Key, ShoppingBag, Layers, 
  Package, ShoppingCart, DollarSign, Bell, Truck, 
  MessageSquare, Globe, ChevronDown, ChevronRight, LayoutDashboard,
  Menu, X, Search, LogOut, CheckCircle2, Lock
} from "lucide-react";

import "./AmazonDashboard.css"; 

// API Module Imports
import AmazonTokenGenerator from "./Authentication/AmazonTokenGenerator";
import MarketplaceParticipations from "./Seller APIs/MarketplaceParticipations";
import CatalogItem from "./Catalog APIs/CatalogItem";
import Pricing from "./Pricing APIs/Pricing";
import CatalogSearch from "./Catalog APIs/CatalogSearch";
import CreateListing from "./Listings APIs/CreateListing";
import GetListing from "./Listings APIs/GetListing";
import UpdateListing from "./Listings APIs/UpdateListing";
import DeleteListing from "./Listings APIs/DeleteListing";
import ListingSubmission from "./Listings APIs/ListingSubmission";
import Orders from "./Orders APIs/Orders";
import GetOrder from "./Orders APIs/GetOrder";
import GetOrderItems from "./Orders APIs/GetOrderItems";
import CreateReport from "./Orders APIs/CreateReport";
import GetReportDocument from "./Orders APIs/GetReportDocument";
import CreateFeedDocument from "./Feeds APIs/CreateFeedDocument";
import CreateFeed from "./Feeds APIs/CreateFeed";
import GetFeed from "./Feeds APIs/GetFeed";
import Finances from "./Finances/Finances";
import Shipping from "./Shipping/Shipping";
import GetRates from "./Shipping/GetRates";
import PurchaseLabel from "./Shipping/PurchaseLabel";
import TrackingDetails from "./Shipping/TrackingDetails";
import Messaging from "./Messaging/Messaging";
import MessageTemplates from "./Messaging/MessageTemplates";
import SendMessage from "./Messaging/SendMessage";
import Notifications from "./Notifications/Notifications";
import CreateDestination from "./Notifications/CreateDestination";
import CreateSubscription from "./Notifications/CreateSubscription";
import NotificationResult from "./Notifications/NotificationResult";
import ProductTypeDefinitions from "./ProductTypeDefinitions/ProductTypeDefinitions";
import SearchProductTypes from "./ProductTypeDefinitions/SearchProductTypes";
import ProductTypeSchema from "./ProductTypeDefinitions/ProductTypeSchema";
import ProductPricing from "./Listings APIs/ProductPricing";
import Inventory from "./Pricing APIs/Inventory";

const AmazonOverview = () => (
  <div className="amazon-overview-card">
    <h2>Amazon SP-API Overview</h2>
    <p>
      Manage your Amazon SP-API integrations, active listings, order reports, and analytics 
      from a central operational console.
    </p>
  </div>
);

const AmazonDashboard = () => {
  const [activeTab, setActiveTab] = useState("amazon-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Global Authentication State
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("sandbox");
  const [marketplaceIds, setMarketplaceIds] = useState("ATVPDKIKX0DER");

  const isAuthenticated = Boolean(accessToken && accessToken.trim() !== "");

  const [expanded, setExpanded] = useState({
    dashboards: true,
    auth: true,
    seller: false,
    product: false,
    listings: false,
    orders: false,
    finances: false,
    notifications: false,
    shipping: false,
    messaging: false,
    feeds: false,
  });

  // Automatically expand ALL sidebar categories when authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      setExpanded({
        dashboards: true,
        auth: true,
        seller: true,
        product: true,
        listings: true,
        orders: true,
        finances: true,
        notifications: true,
        shipping: true,
        messaging: true,
        feeds: true,
      });
    }
  }, [isAuthenticated]);

  const commonProps = {
    accessToken,
    setAccessToken,
    awsAccessKey,
    setAwsAccessKey,
    awsSecretKey,
    setAwsSecretKey,
    region,
    setRegion,
    environment,
    setEnvironment,
    marketplaceIds,
    setMarketplaceIds,
  };

  const categories = [
    {
      key: "dashboards",
      title: "Main Dashboards",
      icon: LayoutDashboard,
      requiresAuth: false,
      items: [
        { id: "amazon-dashboard", label: "Amazon Overview", Component: AmazonOverview },
      ],
    },
    {
      key: "auth",
      title: "Authentication",
      icon: Key,
      requiresAuth: false,
      items: [{ id: "token", label: "Token Generator", Component: AmazonTokenGenerator }],
    },
    {
      key: "seller",
      title: "Seller & Catalog",
      icon: ShoppingBag,
      requiresAuth: true,
      items: [
        { id: "marketplace", label: "Marketplace Participations", Component: MarketplaceParticipations },
        { id: "catalogSearch", label: "Catalog Item Search", Component: CatalogSearch },
        { id: "catalog", label: "Catalog Item Details", Component: CatalogItem },
        { id: "pricing", label: "Pricing", Component: Pricing },
        { id: "inventory", label: "Inventory", Component: Inventory },
      ],
    },
    {
      key: "product",
      title: "Product Types",
      icon: Layers,
      requiresAuth: true,
      items: [
        { id: "product-types-home", label: "Product Type Definition", Component: ProductTypeDefinitions },
        { id: "search-product-types", label: "Search Product Types", Component: SearchProductTypes },
        { id: "product-type-schema", label: "Product Type Schema", Component: ProductTypeSchema },
      ],
    },
    {
      key: "listings",
      title: "Listings",
      icon: Package,
      requiresAuth: true,
      items: [
        { id: "create-listing", label: "Create Listing", Component: CreateListing },
        { id: "get-listing", label: "Get Listing", Component: GetListing },
        { id: "update-listing", label: "Update Listing", Component: UpdateListing },
        { id: "delete-listing", label: "Delete Listing", Component: DeleteListing },
        { id: "listing-submission", label: "Listing Submission", Component: ListingSubmission },
        { id: "product-pricing", label: "Product Pricing", Component: ProductPricing },
      ],
    },
    {
      key: "orders",
      title: "Orders & Reports",
      icon: ShoppingCart,
      requiresAuth: true,
      items: [
        { id: "get-orders", label: "Get Orders", Component: Orders },
        { id: "get-order", label: "Get Order Details", Component: GetOrder },
        { id: "get-order-items", label: "Get Order Items", Component: GetOrderItems },
        { id: "create-report", label: "Create Report", Component: CreateReport },
        { id: "get-report-doc", label: "Get Report Document", Component: GetReportDocument },
      ],
    },
    {
      key: "finances",
      title: "Finances",
      icon: DollarSign,
      requiresAuth: true,
      items: [{ id: "finances", label: "Financial Events", Component: Finances }],
    },
    {
      key: "notifications",
      title: "Notifications",
      icon: Bell,
      requiresAuth: true,
      items: [
        { id: "notifications", label: "Overview", Component: Notifications },
        { id: "create-destination", label: "Create Destination", Component: CreateDestination },
        { id: "create-subscription", label: "Create Subscription", Component: CreateSubscription },
        { id: "notification-result", label: "Notification Result", Component: NotificationResult },
      ],
    },
    {
      key: "shipping",
      title: "Shipping",
      icon: Truck,
      requiresAuth: true,
      items: [
        { id: "shipping-home", label: "Overview", Component: Shipping },
        { id: "get-rates", label: "Get Rates", Component: GetRates },
        { id: "purchase-label", label: "Purchase Label", Component: PurchaseLabel },
        { id: "tracking-details", label: "Tracking Details", Component: TrackingDetails },
      ],
    },
    {
      key: "messaging",
      title: "Messaging",
      icon: MessageSquare,
      requiresAuth: true,
      items: [
        { id: "messaging-home", label: "Overview", Component: Messaging },
        { id: "message-templates", label: "Message Templates", Component: MessageTemplates },
        { id: "send-message", label: "Send Message", Component: SendMessage },
      ],
    },
    {
      key: "feeds",
      title: "Feeds & Uploads",
      icon: Globe,
      requiresAuth: true,
      items: [
        { id: "create-feed-doc", label: "Create Feed Document", Component: CreateFeedDocument },
        { id: "create-feed", label: "Create Feed", Component: CreateFeed },
        { id: "get-feed", label: "Get Feed Status", Component: GetFeed },
      ],
    },
  ];

  const activeItem = categories
    .flatMap((c) => c.items)
    .find((i) => i.id === activeTab);

  const ActiveComponent = activeItem?.Component;

  const toggleCategory = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="dashboard-container">
      {sidebarOpen && (
        <div
          className="mobile-overlay mobile-only"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="icon-badge">
              <BarChart3 size={20} color="#ffffff" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="brand-title">Amazon SP-API</h1>
                <p className="brand-subtitle">Control Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="icon-button mobile-only"
          >
            <X size={20} />
          </button>
        </div>

        {/* Authentication Status Banner in Sidebar */}
        {sidebarOpen && (
          <div className={`auth-status-bar ${isAuthenticated ? "authed" : "unauthed"}`}>
            {isAuthenticated ? (
              <>
                <CheckCircle2 size={15} />
                <span>Authenticated & Active</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Auth Required</span>
              </>
            )}
          </div>
        )}

        <div className="sidebar-content">
          {categories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expanded[category.key];

            return (
              <div key={category.key} className="category-wrapper">
                <button
                  onClick={() => toggleCategory(category.key)}
                  className={`category-button ${isExpanded ? "expanded" : ""}`}
                  title={!sidebarOpen ? category.title : ""}
                >
                  <div className="category-info">
                    <Icon
                      size={18}
                      className={isAuthenticated || !category.requiresAuth ? "icon-active" : "icon-muted"}
                    />
                    {sidebarOpen && (
                      <span className="category-title">{category.title}</span>
                    )}
                  </div>

                  {sidebarOpen &&
                    (isExpanded ? (
                      <ChevronDown size={16} className="icon-muted" />
                    ) : (
                      <ChevronRight size={16} className="icon-muted" />
                    ))}
                </button>

                {isExpanded && sidebarOpen && (
                  <div className="submenu">
                    {category.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const isDisabled = category.requiresAuth && !isAuthenticated;

                      return (
                        <button
                          key={item.id}
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              setActiveTab(item.id);
                              if (window.innerWidth < 1024) {
                                setSidebarOpen(false);
                              }
                            }
                          }}
                          className={`submenu-button ${isActive ? "active" : ""} ${
                            isDisabled ? "disabled" : ""
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button
            className="logout-button"
            onClick={() => setAccessToken("")}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={19} />
            {sidebarOpen && <span>{isAuthenticated ? "Clear Token" : "Logout"}</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="main-area">
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="toggle-btn"
              title={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <div className="page-title-group">
                <span className="breadcrumb">Dashboard</span>
                <ChevronRight size={14} color="#cbd5e1" />
                <h2 className="active-page-name">
                  {activeItem?.label || "Select Module"}
                </h2>
              </div>
              <p className="page-subheading">
                Amazon Seller Partner API Management
              </p>
            </div>
          </div>

          <div className="navbar-right">
            <button className="toggle-btn">
              <Search size={16} />
            </button>

            <span
              className={`badge ${
                environment === "sandbox" ? "badge-sandbox" : "badge-production"
              }`}
            >
              {environment.toUpperCase()}
            </span>

            <span className="badge badge-region">{region}</span>
          </div>
        </header>

        <section className="content-section">
          <div className="content-max-width">
            <div className="section-header">
              <h1 className="section-title">
                {activeItem?.label || "Dashboard"}
              </h1>
              <p className="section-desc">
                Manage and monitor your Amazon Seller Partner API operations.
              </p>
            </div>

            <div className="main-card">
              {ActiveComponent ? (
                <div className="card-content">
                  <ActiveComponent {...commonProps} />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <LayoutDashboard size={32} />
                  </div>
                  <h3 className="empty-title">No Tool Selected</h3>
                  <p className="empty-desc">
                    Select an API endpoint or analytics module from the sidebar
                    to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AmazonDashboard;