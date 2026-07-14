import React, { useState } from "react";

// Auth
import AmazonTokenGenerator from "./Authentication/AmazonTokenGenerator";

// Seller & Catalog
import MarketplaceParticipations from "./Seller APIs/MarketplaceParticipations";
import CatalogItem from "./Catalog APIs/CatalogItem";
import Pricing from "./Pricing APIs/Pricing";
import CatalogSearch from "./Catalog APIs/CatalogSearch";

// Listings
import CreateListing from "./Listings APIs/CreateListing";
import GetListing from "./Listings APIs/GetListing";
import UpdateListing from "./Listings APIs/UpdateListing";
import DeleteListing from "./Listings APIs/DeleteListing";
import ListingSubmission from "./Listings APIs/ListingSubmission";

// Orders
import Orders from "./Orders APIs/Orders";
import GetOrder from "./Orders APIs/GetOrder";
import GetOrderItems from "./Orders APIs/GetOrderItems";

// Reports
import CreateReport from "./Reports APIs/CreateReport";
import GetReport from "./Reports APIs/GetReport";
import GetReportDocument from "./Reports APIs/GetReportDocument";

// Feeds
import CreateFeedDocument from "./Feeds APIs/CreateFeedDocument";
import CreateFeed from "./Feeds APIs/CreateFeed";
import GetFeed from "./Feeds APIs/GetFeed";

// Uploads
import Uploads from "./Uploads APIs/Uploads";

// Finances
import Finances from "./Finances/Finances";

// Shipping
import Shipping from "./Shipping/Shipping";
import GetRates from "./Shipping/GetRates";
import PurchaseLabel from "./Shipping/PurchaseLabel";
import TrackingDetails from "./Shipping/TrackingDetails";

// Messaging
import Messaging from "./Messaging/Messaging";
import MessageTemplates from "./Messaging/MessageTemplates";
import SendMessage from "./Messaging/SendMessage";

// Notifications
import Notifications from "./Notifications/Notifications";
import CreateDestination from "./Notifications/CreateDestination";
import CreateSubscription from "./Notifications/CreateSubscription";
import NotificationResult from "./Notifications/NotificationResult";

// ProductTypeDefinitions
import ProductTypeDefinitions from "./ProductTypeDefinitions/ProductTypeDefinitions";
import SearchProductTypes from "./ProductTypeDefinitions/SearchProductTypes";
import ProductTypeSchema from "./ProductTypeDefinitions/ProductTypeSchema";



const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("token");

 const [expanded, setExpanded] = useState({
  auth: true,
  seller: true,
  product: true,
  listings: true,
  orders: false,
  finances: false,
  notifications: false,
  shipping: false,
  messaging: false,
  reports: false,
  feeds: false,
});

  // Global state
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("sandbox");
  const [marketplaceIds, setMarketplaceIds] = useState("ATVPDKIKX0DER");

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
      key: "auth",
      title: "1. Authentication",
      items: [
        { id: "token", label: "Token Generator", Component: AmazonTokenGenerator },
      ],
    },
    {
  key: "seller",
  title: "2. Seller & Catalog",
  items: [
    { id: "marketplace",label: "Marketplace Participations",Component: MarketplaceParticipations},
    { id: "catalogSearch",label: "Catalog Item Search",Component: CatalogSearch},
    { id: "catalog",label: "CatalogItemDetails",Component: CatalogItem},
    { id: "pricing", label: "Pricing",Component: Pricing},
    ],
},
    {
      key: "product",
      title: "3. Product Types",
      items: [
        { id: "product-types-home", label: "producttypeDefinition", Component: ProductTypeDefinitions },
        { id: "search-product-types", label: "Search Product Types", Component: SearchProductTypes },
        { id: "product-type-schema", label: "Product Type Schema", Component: ProductTypeSchema },
      ],
    },
    {
      key: "listings",
      title: "4. Listings",
      items: [
        { id: "create-listing", label: "Create Listing", Component: CreateListing },
        { id: "get-listing", label: "Get Listing", Component: GetListing },
        { id: "update-listing", label: "Update Listing", Component: UpdateListing },
        { id: "delete-listing", label: "Delete Listing", Component: DeleteListing },
        { id: "listing-submission", label: "Listing Submission", Component: ListingSubmission },
      ],
    },
    {
      key: "orders",
      title: "5. Orders",
      items: [
        { id: "get-orders", label: "Get Orders", Component: Orders },
        { id: "get-order", label: "Get Order", Component: GetOrder },
        { id: "get-order-items", label: "Get Order Items", Component: GetOrderItems },
      ],
    },
    {
      key: "finances",
      title: "6. Finances",
      items: [{ id: "finances", label: "Financial Events", Component: Finances }],
    },
    {
      key: "notifications",
      title: "7. Notifications",
      items: [
        { id: "notifications", label: "Notifications", Component: Notifications },
        { id: "create-destination", label: "Create Destination", Component: CreateDestination },
        { id: "create-subscription", label: "Create Subscription", Component: CreateSubscription },
        { id: "notification-result", label: "Notification Result", Component: NotificationResult },
      ],
    },
    { 
      key: "shipping",
      title: "8. Shipping",
      items: [
       { id: "shipping-home", label: "Overview", Component: Shipping },
       { id: "get-rates", label: "Get Rates", Component: GetRates },
       { id: "purchase-label", label: "Purchase Label", Component: PurchaseLabel },
       { id: "tracking-details", label: "Tracking Details", Component: TrackingDetails },
      ],
},
{
  key: "messaging",
  title: "9. Messaging",
  items: [
    { id: "messaging-home", label: "Messaging", Component: Messaging },
    { id: "message-templates", label: "Message Templates", Component: MessageTemplates },
    { id: "send-message", label: "Send Message", Component: SendMessage },
  ],
},
    {
      key: "reports",
      title: "10. Reports",
      items: [
        { id: "create-report", label: "Create Report", Component: CreateReport },
        { id: "get-report", label: "Get Report", Component: GetReport },
        { id: "get-report-doc", label: "Get Report Document", Component: GetReportDocument },
      ],
    },
    {
      key: "feeds",
      title: "11. Feeds & Uploads",
      items: [
        { id: "create-feed-doc", label: "Create Feed Document", Component: CreateFeedDocument },
        { id: "create-feed", label: "Create Feed", Component: CreateFeed },
        { id: "get-feed", label: "Get Feed", Component: GetFeed },
        { id: "uploads", label: "Uploads", Component: Uploads },
      ],
    },
  ];

  const ActiveComponent = categories
    .flatMap((c) => c.items)
    .find((i) => i.id === activeTab)?.Component;

  const toggleCategory = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "340px",
          background: "#1e293b",
          color: "#e2e8f0",
          padding: "20px",
          overflowY: "auto",
          borderRight: "1px solid #334155",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#60a5fa",
            fontSize: "1.5rem",
          }}
        >
          Amazon SP-API
        </h2>

        {categories.map((category) => (
          <div key={category.key} style={{ marginBottom: "16px" }}>
            <button
              onClick={() => toggleCategory(category.key)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#334155",
                color: "#e2e8f0",
                border: "none",
                borderRadius: "6px",
                textAlign: "left",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {category.title}
              <span>{expanded[category.key] ? "▼" : "▶"}</span>
            </button>

            {expanded[category.key] && (
              <div style={{ marginTop: "6px" }}>
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      marginBottom: "4px",
                      background: activeTab === item.id ? "#3b82f6" : "transparent",
                      color: activeTab === item.id ? "white" : "#cbd5e1",
                      border: "none",
                      borderRadius: "6px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.2s",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            minHeight: "90vh",
          }}
        >
          {ActiveComponent ? (
            <ActiveComponent {...commonProps} />
          ) : (
            <div style={{ textAlign: "center", color: "#64748b", padding: "60px 20px" }}>
              <h3>Select a tool from the sidebar</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;