import React, { useState, useEffect } from "react";
import {
  BarChart3, Key, ShoppingBag, Layers, Package, ShoppingCart,
  DollarSign, Bell, Truck, MessageSquare, Globe, ChevronDown,
  ChevronRight, LayoutDashboard, Menu, X, Search, LogOut,
  CheckCircle2, Lock
} from "lucide-react";
import "./AmazonDashboard.css";

// === AUTHENTICATION - Your real files ===
import AmazonTokenGenerator from "./Authentication/AmazonTokenGenerator.js";
import TokenGenerator from "./Authorization/TokenGenerator.jsx";
import MarketplaceParticipations from "./Seller APIs/MarketplaceParticipations.js";

// === CATALOG - Your real files ===
import CatalogItem from "./Catalog APIs/CatalogItem.js";
import CatalogSearch from "./Catalog APIs/CatalogSearch.js";
import SearchProductTypes from "./ProductTypeDefinitions/SearchProductTypes.js";
import ProductTypeDefinitions from "./ProductTypeDefinitions/ProductTypeDefinitions.js";
import ProductTypeSchema from "./ProductTypeDefinitions/ProductTypeSchema.js";
import ListingsRestrictions from "./Listings Restrictions/ListingsRestrictions.jsx";

// === PRICING ===
import Pricing from "./Pricing APIs/Pricing.js";
import ProductPricing from "./Pricing APIs/ProductPricing.js";
import GetFeesEstimate from "./Product Fees/GetFeesEstimate.jsx";

// === FBA INVENTORY ===
import FBAInventory from "./FBA Inventory/FBAInventory.js";
import FBAInboundEligibility from "./FBA Inventory/FBAInboundEligibility.js";

// === LISTINGS ===
import CreateListing from "./Listings APIs/CreateListing.js";
import GetListing from "./Listings APIs/GetListing.js";
import UpdateListing from "./Listings APIs/UpdateListing.js";
import DeleteListing from "./Listings APIs/DeleteListing.js";
import ListingSubmission from "./Listings APIs/ListingSubmission.js";

// === ORDERS ===
import Orders from "./Orders APIs/Orders.js";
import ListOrders from "./Orders APIs/ListOrders.jsx";
import GetOrder from "./Orders APIs/GetOrder.js";
import GetOrderDetails from "./Orders APIs/GetOrderDetails.jsx";
import GetOrderItems from "./Orders APIs/GetOrderItems.js";

// === REPORTS ===
import CreateReport from "./Reports APIs/CreateReport.js";
import GetReport from "./Reports APIs/GetReport.js";
import GetReportDocument from "./Reports APIs/GetReportDocument.js";
import ReportsAPI from "./Reports APIs/ReportsAPI.js";

// === FINANCES, SALES, INVOICES ===
import Finances from "./Finances/Finances.js";
import OrderMetrics from "./Sales APIs/OrderMetrics.jsx";
import GetInvoices from "./Invoices/GetInvoices.js";

// === FEEDS ===
import CreateFeedDocument from "./Feeds APIs/CreateFeedDocument.js";
import CreateFeed from "./Feeds APIs/CreateFeed.js";
import GetFeed from "./Feeds APIs/GetFeed.js";
import Uploads from "../Uploads APIs/Uploads.js";

// === FULFILLMENT ===
import FBAInbound from "./Fulfillment APIs/FBAInbound.js";
import FBAOutbound from "./Fulfillment APIs/FBAOutbound.jsx";
import InboundShipments from "./Fulfillment APIs/InboundShipments.js";
import OutboundOrders from "./Fulfillment APIs/OutboundOrders.js";

// === EASY SHIPMENT ===
import ListHandoverSlots from "./Easyshipment/ListHandoverSlots.js";
import GetScheduledPackage from "./Easyshipment/GetScheduledPackage.js";
import CreateScheduledPackage from "./Easyshipment/CreateScheduledPackage.js";
import UpdateScheduledPackages from "./Easyshipment/UpdateScheduledPackages.js";

// === SHIPPING ===
import Shipping from "./Shipping/Shipping.js";
import GetRates from "./Shipping/GetRates.js";
import PurchaseLabel from "./Shipping/PurchaseLabel.js";
import TrackingDetails from "./Shipping/TrackingDetails.js";

// === MESSAGING ===
import Messaging from "./Messaging/Messaging.js";
import MessageTemplates from "./Messaging/MessageTemplates.js";
import SendMessage from "./Messaging/SendMessage.js";
import CreateSolicitation from "./Solicitations/CreateSolicitation.js";

// === NOTIFICATIONS ===
import Notifications from "./Notifications/Notifications.js";
import CreateDestination from "./Notifications/CreateDestination.js";
import CreateSubscription from "./Notifications/CreateSubscription.js";
import NotificationResult from "./Notifications/NotificationResult.js";

// === FEEDBACK, SERVICES, A+, REPLENISHMENT ===
import ItemReviewTopics from "./Customer Feedback/ItemReviewTopics.js";
import ServiceJobs from "./Services/ServiceJobs.js";
import APlusContent from "./APlus Content/APlusContent.jsx";
import ReplenishmentOffers from "./Replenishment/ReplenishmentOffers.js";

// === DATA KIOSK ===
import CreateQuery from "./Data Kiosk/CreateQuery.js";
import GetQuery from "./Data Kiosk/GetQuery.jsx";
import GetDocument from "./Data Kiosk/GetDocument.jsx";

const AmazonOverview = () => (
  <div className="amazon-overview-card">
    <h2>Amazon SP-API - 40 APIs Connected</h2>
    <p>All components mapped to your real folder structure. Auth → Catalog → Listings → Orders → Reports → FBA → Feeds</p>
  </div>
);

const AmazonDashboard = () => {
  const [activeTab, setActiveTab] = useState("amazon-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("amazon_access_token") || "");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("sandbox");
  const [marketplaceIds, setMarketplaceIds] = useState("ATVPDKIKX0DER");
  const isAuthenticated = Boolean(accessToken && accessToken.trim()!== "");
  const [expanded, setExpanded] = useState({ dashboards: true, auth: true, seller: false, product: false, listings: false, orders: false, finances: false, notifications: false, shipping: false, messaging: false, feeds: false, fulfillment: false, easyship: false, data: false });

  useEffect(() => { if (isAuthenticated) { localStorage.setItem("amazon_access_token", accessToken); setExpanded({ dashboards: true, auth: true, seller: true, product: true, listings: true, orders: true, finances: true, notifications: true, shipping: true, messaging: true, feeds: true, fulfillment: true, easyship: true, data: true }); } }, [isAuthenticated, accessToken]);

  const commonProps = { accessToken, setAccessToken, awsAccessKey, setAwsAccessKey, awsSecretKey, setAwsSecretKey, region, setRegion, environment, setEnvironment, marketplaceIds, setMarketplaceIds };

  const categories = [
    { key: "dashboards", title: "Main", icon: LayoutDashboard, requiresAuth: false, items: [{ id: "amazon-dashboard", label: "Overview", Component: AmazonOverview }] },
    { key: "auth", title: "Authentication", icon: Key, requiresAuth: false, items: [{ id: "token1", label: "Amazon Token Generator", Component: AmazonTokenGenerator }, { id: "token2", label: "LWA Token Generator", Component: TokenGenerator }, { id: "marketplace", label: "Marketplace Participations", Component: MarketplaceParticipations }] },
    { key: "seller", title: "Seller & Catalog", icon: ShoppingBag, requiresAuth: true, items: [{ id: "catalogSearch", label: "Catalog Search", Component: CatalogSearch }, { id: "catalog", label: "Catalog Item", Component: CatalogItem }, { id: "pricing", label: "Pricing v0", Component: Pricing }, { id: "product-pricing", label: "Pricing 2022", Component: ProductPricing }, { id: "fees", label: "Fees Estimate", Component: GetFeesEstimate }, { id: "inventory", label: "FBA Inventory", Component: FBAInventory }, { id: "inbound-elig", label: "Inbound Eligibility", Component: FBAInboundEligibility }] },
    { key: "product", title: "Product Types", icon: Layers, requiresAuth: true, items: [{ id: "search-product-types", label: "Search Product Types", Component: SearchProductTypes }, { id: "product-def", label: "Product Type Definitions", Component: ProductTypeDefinitions }, { id: "product-schema", label: "Product Type Schema", Component: ProductTypeSchema }, { id: "restrictions", label: "Listings Restrictions", Component: ListingsRestrictions }] },
    { key: "listings", title: "Listings", icon: Package, requiresAuth: true, items: [{ id: "create-listing", label: "Create Listing", Component: CreateListing }, { id: "get-listing", label: "Get Listing", Component: GetListing }, { id: "update-listing", label: "Update Listing", Component: UpdateListing }, { id: "delete-listing", label: "Delete Listing", Component: DeleteListing }, { id: "listing-submission", label: "Submission Status", Component: ListingSubmission }, { id: "aplus", label: "A+ Content", Component: APlusContent }] },
    { key: "orders", title: "Orders", icon: ShoppingCart, requiresAuth: true, items: [{ id: "orders", label: "Get Orders", Component: Orders }, { id: "list-orders", label: "List Orders", Component: ListOrders }, { id: "get-order", label: "Get Order", Component: GetOrder }, { id: "get-order-details", label: "Get Order Details", Component: GetOrderDetails }, { id: "get-order-items", label: "Get Order Items", Component: GetOrderItems }, { id: "solicitation", label: "Create Solicitation", Component: CreateSolicitation }] },
    { key: "finances", title: "Reports & Finances", icon: DollarSign, requiresAuth: true, items: [{ id: "create-report", label: "Create Report", Component: CreateReport }, { id: "get-report", label: "Get Report", Component: GetReport }, { id: "get-report-doc", label: "Get Report Document", Component: GetReportDocument }, { id: "reports-api", label: "Reports API", Component: ReportsAPI }, { id: "finances", label: "Finances", Component: Finances }, { id: "sales-metrics", label: "Order Metrics", Component: OrderMetrics }, { id: "invoices", label: "Invoices", Component: GetInvoices }, { id: "replenishment", label: "Replenishment", Component: ReplenishmentOffers }] },
    { key: "fulfillment", title: "FBA Fulfillment", icon: Truck, requiresAuth: true, items: [{ id: "fba-inbound", label: "FBA Inbound", Component: FBAInbound }, { id: "fba-outbound", label: "FBA Outbound", Component: FBAOutbound }, { id: "inbound-ship", label: "Inbound Shipments", Component: InboundShipments }, { id: "outbound-orders", label: "Outbound Orders", Component: OutboundOrders }, { id: "service-jobs", label: "Service Jobs", Component: ServiceJobs }] },
    { key: "easyship", title: "EasyShip", icon: Package, requiresAuth: true, items: [{ id: "handover-slots", label: "Handover Slots", Component: ListHandoverSlots }, { id: "get-package", label: "Get Scheduled Package", Component: GetScheduledPackage }, { id: "create-package", label: "Create Scheduled Package", Component: CreateScheduledPackage }, { id: "update-package", label: "Update Package", Component: UpdateScheduledPackages }] },
    { key: "shipping", title: "Shipping", icon: Truck, requiresAuth: true, items: [{ id: "shipping", label: "Shipping", Component: Shipping }, { id: "get-rates", label: "Get Rates", Component: GetRates }, { id: "purchase-label", label: "Purchase Label", Component: PurchaseLabel }, { id: "tracking", label: "Tracking", Component: TrackingDetails }] },
    { key: "messaging", title: "Messaging", icon: MessageSquare, requiresAuth: true, items: [{ id: "messaging", label: "Messaging", Component: Messaging }, { id: "message-templates", label: "Message Templates", Component: MessageTemplates }, { id: "send-message", label: "Send Message", Component: SendMessage }, { id: "feedback", label: "Item Review Topics", Component: ItemReviewTopics }] },
    { key: "notifications", title: "Notifications", icon: Bell, requiresAuth: true, items: [{ id: "notifications", label: "Notifications", Component: Notifications }, { id: "create-destination", label: "Create Destination", Component: CreateDestination }, { id: "create-subscription", label: "Create Subscription", Component: CreateSubscription }, { id: "notification-result", label: "Notification Result", Component: NotificationResult }] },
    { key: "feeds", title: "Feeds & Uploads", icon: Globe, requiresAuth: true, items: [{ id: "create-feed-doc", label: "Create Feed Document", Component: CreateFeedDocument }, { id: "create-feed", label: "Create Feed", Component: CreateFeed }, { id: "get-feed", label: "Get Feed", Component: GetFeed }, { id: "uploads", label: "Uploads", Component: Uploads }] },
    { key: "data", title: "Data Kiosk", icon: BarChart3, requiresAuth: true, items: [{ id: "create-query", label: "Create Query", Component: CreateQuery }, { id: "get-query", label: "Get Query", Component: GetQuery }, { id: "get-document", label: "Get Document", Component: GetDocument }] },
  ];

  const activeItem = categories.flatMap(c => c.items).find(i => i.id === activeTab);
  const ActiveComponent = activeItem?.Component;
  const toggleCategory = (key) => setExpanded(prev => ({...prev, [key]:!prev[key] }));

  return (
    <div className="dashboard-container">
      {sidebarOpen && <div className="mobile-overlay mobile-only" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper"><div className="icon-badge"><BarChart3 size={20} color="#fff" /></div>{sidebarOpen && <div><h1 className="brand-title">Amazon SP-API</h1><p className="brand-subtitle">40 APIs - Control Panel</p></div>}</div>
          <button onClick={() => setSidebarOpen(false)} className="icon-button mobile-only"><X size={20} /></button>
        </div>
        {sidebarOpen && <div className={`auth-status-bar ${isAuthenticated? "authed" : "unauthed"}`}>{isAuthenticated? <><CheckCircle2 size={15} /><span>Authenticated</span></> : <><Lock size={15} /><span>Auth Required</span></>}</div>}
        <div className="sidebar-content">
          {categories.map(category => {
            const Icon = category.icon; const isExpanded = expanded[category.key];
            return (
              <div key={category.key} className="category-wrapper">
                <button onClick={() => toggleCategory(category.key)} className={`category-button ${isExpanded? "expanded" : ""}`}><div className="category-info"><Icon size={18} className={isAuthenticated ||!category.requiresAuth? "icon-active" : "icon-muted"} />{sidebarOpen && <span className="category-title">{category.title}</span>}</div>{sidebarOpen && (isExpanded? <ChevronDown size={16} /> : <ChevronRight size={16} />)}</button>
                {isExpanded && sidebarOpen && <div className="submenu">{category.items.map(item => { const isActive = activeTab === item.id; const isDisabled = category.requiresAuth &&!isAuthenticated; return <button key={item.id} disabled={isDisabled} onClick={() =>!isDisabled && setActiveTab(item.id)} className={`submenu-button ${isActive? "active" : ""} ${isDisabled? "disabled" : ""}`}>{item.label}</button>; })}</div>}
              </div>
            );
          })}
        </div>
        <div className="sidebar-footer"><button className="logout-button" onClick={() => { setAccessToken(""); localStorage.clear(); }}><LogOut size={19} />{sidebarOpen && <span>Logout</span>}</button></div>
      </aside>
      <main className="main-area">
        <header className="top-navbar"><div className="navbar-left"><button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">{sidebarOpen? <ChevronRight size={20} /> : <Menu size={20} />}</button><div><div className="page-title-group"><span className="breadcrumb">Amazon</span><ChevronRight size={14} /><h2 className="active-page-name">{activeItem?.label}</h2></div></div></div><div className="navbar-right"><span className={`badge ${environment === "sandbox"? "badge-sandbox" : "badge-production"}`}>{environment.toUpperCase()}</span><span className="badge badge-region">{region}</span></div></header>
        <section className="content-section"><div className="content-max-width"><div className="main-card">{ActiveComponent? <div className="card-content"><ActiveComponent {...commonProps} /></div> : <div>Select Module</div>}</div></div></section>
      </main>
    </div>
  );
};
export default AmazonDashboard;