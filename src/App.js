import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";

// ============================================================
// COMMON
// ============================================================

import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import Sellerlist from "./components/Common/Sellerlist";
import SellerCustomerlist from "./components/Common/SellerCustomerlist";

// ============================================================
// MYSTORE
// ============================================================

import MyStoreDashboard from "./components/MyStore/MyStoreDashboard";
import AddProduct from "./components/MyStore/AddProduct";

// ============================================================
// AMAZON
// ============================================================

import AmazonLayout from "./components/Amazon/AmazonLayout";
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator";
import AmazonRootRedirect from "./components/Amazon/AmazonRootRedirect";
import CreateListing from "./components/Amazon/ListingsAPIs/CreateListing";

// ============================================================
// FLIPKART
// ============================================================

import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard";
import ListingsCommonV3Api from "./components/Flipkart/CatalogAPIs/ListingsCommonV3Api";

// ============================================================
// UNIWARE - AUTHENTICATION
// ============================================================

import UniwareAuth from "./components/Unicommercece/Authentication/UniwareAuth";

// ============================================================
// UNIWARE - EXPORT JOB
// ============================================================

import CreateExportJob from "./components/Unicommercece/EXPORT_JOB/CreateExportJob";
import GetExportJobStatus from "./components/Unicommercece/EXPORT_JOB/GetExportJobStatus";

// ============================================================
// UNIWARE - FACILITY
// ============================================================

import SearchFacilities from "./components/Unicommercece/Facility/SearchFacilities";
import GetFacilityDetails from "./components/Unicommercece/Facility/GetFacilityDetails";

// ============================================================
// UNIWARE - FULFILLMENT
// ============================================================

import AddShippingPackageToManifest from "./components/Unicommercece/FULFILLMENT/AddShippingPackageToManifest";

import AllocateShippingProvider from "./components/Unicommercece/FULFILLMENT/AllocateShippingProvider";

import CheckServiceability from "./components/Unicommercece/FULFILLMENT/CheckServiceability";

import CloseShippingManifest from "./components/Unicommercece/FULFILLMENT/CloseShippingManifest";

import CreateAndDispatchShippingPackage from "./components/Unicommercece/FULFILLMENT/CreateAndDispatchShippingPackage";

import CreateCompleteManifest from "./components/Unicommercece/FULFILLMENT/CreateCompleteManifest";

import CreateInvoice from "./components/Unicommercece/FULFILLMENT/CreateInvoice";

import CreateInvoiceAndGenerateLabel from "./components/Unicommercece/FULFILLMENT/CreateInvoiceAndGenerateLabel";

import CreateInvoiceAndLabel from "./components/Unicommercece/FULFILLMENT/CreateInvoiceAndLabel";

import CreateInvoiceBySaleOrder from "./components/Unicommercece/FULFILLMENT/CreateInvoiceBySaleOrder";

// ============================================================
// UNIWARE - INBOUND
// ============================================================

import AddGRNItem from "./components/Unicommercece/INBOUND/AddGRNItem";
import AddGRNItemSKU from "./components/Unicommercece/INBOUND/AddGRNItemSKU";
import ApprovePurchaseOrder from "./components/Unicommercece/INBOUND/ApprovePurchaseOrder";
import ClosePurchaseOrder from "./components/Unicommercece/INBOUND/ClosePurchaseOrder";
import CreateApprovedPurchaseOrder from "./components/Unicommercece/INBOUND/CreateApprovedPurchaseOrder";
import CreateGRN from "./components/Unicommercece/INBOUND/CreateGRN";
import CreatePurchaseOrder from "./components/Unicommercece/INBOUND/CreatePurchaseOrder";
import GetGRN from "./components/Unicommercece/INBOUND/GetGRN";
import GetPurchaseOrderDetails from "./components/Unicommercece/INBOUND/GetPurchaseOrderDetails";
import SearchGRNs from "./components/Unicommercece/INBOUND/SearchGRNs";
import SearchPurchaseOrders from "./components/Unicommercece/INBOUND/SearchPurchaseOrders";
import Vendor from "./components/Unicommercece/INBOUND/Vendor";
import VendorBackorderItems from "./components/Unicommercece/INBOUND/VendorBackorderItems";
import VendorItemType from "./components/Unicommercece/INBOUND/VendorItemType";

// ============================================================
// UNIWARE - INVENTORY
// ============================================================

import AdjustBatchInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustBatchInventoryBulk";
import AdjustInventory from "./components/Unicommercece/INVENTORY/AdjustInventory";
import AdjustInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustInventoryBulk";
import InventorySnapshot from "./components/Unicommercece/INVENTORY/InventorySnapshot";
import MarkInventoryFound from "./components/Unicommercece/INVENTORY/MarkInventoryFound";
import NearbyStoreInventory from "./components/Unicommercece/INVENTORY/NearbyStoreInventory";

// ============================================================
// UNIWARE - OUTBOUND / GATEPASS
// ============================================================

import AddNonTraceableItem from "./components/Unicommercece/OUTBOUND/AddNonTraceableItem";
import CompleteGatepass from "./components/Unicommercece/OUTBOUND/CompleteGatepass";
import CreateGatepass from "./components/Unicommercece/OUTBOUND/CreateGatepass";
import DiscardGatepass from "./components/Unicommercece/OUTBOUND/DiscardGatepass";
import GetGatepass from "./components/Unicommercece/OUTBOUND/GetGatepass";
import RemoveGatepassItem from "./components/Unicommercece/OUTBOUND/RemoveGatepassItem";
import ScanGatepassItem from "./components/Unicommercece/OUTBOUND/ScanGatepassItem";
import SearchGatepasses from "./components/Unicommercece/OUTBOUND/SearchGatepasses";
import UpdateGatepass from "./components/Unicommercece/OUTBOUND/UpdateGatepass";

// ============================================================
// UNIWARE - PRODUCT
// ============================================================

import ChannelItemTypeCreateOrEdit from "./components/Unicommercece/PRODUCT/ChannelItemTypeCreateOrEdit";
import CreateOrUpdateCategory from "./components/Unicommercece/PRODUCT/CreateOrUpdateCategory";
import CreateOrUpdateItem from "./components/Unicommercece/PRODUCT/CreateOrUpdateItem";
import CreateOrUpdateItems from "./components/Unicommercece/PRODUCT/CreateOrUpdateItems";
import GetItemBarcodeDetails from "./components/Unicommercece/PRODUCT/GetItemBarcodeDetails";
import GetItemDetails from "./components/Unicommercece/PRODUCT/GetItemDetails";
import SearchItems from "./components/Unicommercece/PRODUCT/SearchItems";

// ============================================================
// PLACEHOLDER
// ============================================================

const Placeholder = ({ name }) => (
  <div style={{ padding: 40 }}>
    <h1>{name} - Coming Soon</h1>

    <p
      style={{
        color: "#6b7280",
        fontSize: 13,
      }}
    >
      Route: {window.location.pathname}
    </p>

    <button
      type="button"
      onClick={() => {
        window.location.href = "/marketplaces";
      }}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        border: "1px solid #ddd",
        cursor: "pointer",
        marginTop: 12,
      }}
    >
      ← Back
    </button>
  </div>
);

// ============================================================
// UNIWARE LAYOUT
// ============================================================

function UniwareLayout() {
  const linkStyle = {
    color: "#fff",
    background: "#1f2937",
    padding: "8px 12px",
    borderRadius: 6,
    textDecoration: "none",
    fontSize: 12,
  };

  const navStyle = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    padding: "14px 20px",
    background: "#111827",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: "18px 24px",
          background: "#111827",
          color: "#fff",
        }}
      >
        <h1
          style={{
            margin: 0,
          }}
        >
          Uniware Integration
        </h1>

        <p
          style={{
            margin: "5px 0 0",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          Unicommerce REST API Management
        </p>
      </div>

      {/* NAVIGATION */}

      <nav style={navStyle}>
        <Link
          to="/uniware"
          style={linkStyle}
        >
          Dashboard
        </Link>

        <Link
          to="/uniware/auth"
          style={linkStyle}
        >
          Authentication
        </Link>

        <Link
          to="/uniware/facility/search"
          style={linkStyle}
        >
          Facility
        </Link>

        <Link
          to="/uniware/inbound/po/search"
          style={linkStyle}
        >
          Purchase Orders
        </Link>

        <Link
          to="/uniware/inventory/snapshot"
          style={linkStyle}
        >
          Inventory
        </Link>

        <Link
          to="/uniware/outbound/gatepass/search"
          style={linkStyle}
        >
          Gatepass
        </Link>

        <Link
          to="/uniware/product/search"
          style={linkStyle}
        >
          Products
        </Link>

        <Link
          to="/uniware/export/create"
          style={linkStyle}
        >
          Export
        </Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            MAIN
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
            MYSTORE
        ================================================== */}

        <Route
          path="/mystore/add-product"
          element={<AddProduct />}
        />

        <Route
          path="/mystore/customers/:sellerId/:customerId"
          element={
            <SellerCustomerlist
              marketplace="mystore"
            />
          }
        />

        <Route
          path="/mystore/*"
          element={<MyStoreDashboard />}
        />

        {/* ==================================================
            AMAZON
        ================================================== */}

        <Route
          path="/marketplaces/amazon"
          element={<AmazonLayout />}
        >
          <Route
            index
            element={<AmazonRootRedirect />}
          />

          <Route
            path="dashboard"
            element={<AmazonRootRedirect />}
          />

          <Route
            path="auth/token"
            element={<TokenGenerator />}
          />

          <Route
            path="sellers"
            element={
              <Sellerlist marketplace="amazon" />
            }
          />

          <Route
            path="sellers/:sellerId"
            element={
              <Sellerlist marketplace="amazon" />
            }
          />

          <Route
            path="sellers/:sellerId/customers"
            element={
              <SellerCustomerlist
                marketplace="amazon"
              />
            }
          />

          <Route
            path="seller-customers"
            element={
              <Sellerlist marketplace="amazon" />
            }
          />

          <Route
            path="customers/:sellerId/:customerId"
            element={
              <SellerCustomerlist
                marketplace="amazon"
              />
            }
          />

          <Route
            path="listings/create"
            element={<CreateListing />}
          />

          <Route
            path="add-product"
            element={<CreateListing />}
          />

          <Route
            path="seller/marketplace"
            element={
              <Placeholder
                name="Marketplace Participations"
              />
            }
          />

          <Route
            path="seller/catalog-search"
            element={
              <Placeholder
                name="Catalog Search"
              />
            }
          />

          <Route
            path="seller/catalog"
            element={
              <Placeholder
                name="Catalog Details"
              />
            }
          />

          <Route
            path="seller/pricing"
            element={
              <Placeholder name="Pricing" />
            }
          />

          <Route
            path="seller/inventory"
            element={
              <Placeholder name="Inventory" />
            }
          />
        </Route>

        {/* ==================================================
            FLIPKART
        ================================================== */}

        <Route
          path="/marketplaces/flipkart"
          element={<FlipkartDashboard />}
        >
          <Route
            index
            element={
              <Sellerlist marketplace="flipkart" />
            }
          />

          <Route
            path="dashboard"
            element={
              <Sellerlist marketplace="flipkart" />
            }
          />

          <Route
            path="sellers"
            element={
              <Sellerlist marketplace="flipkart" />
            }
          />

          <Route
            path="seller-customers"
            element={
              <Sellerlist marketplace="flipkart" />
            }
          />

          <Route
            path="sellers/:sellerId/customers"
            element={
              <SellerCustomerlist
                marketplace="flipkart"
              />
            }
          />

          <Route
            path="customers/:sellerId/:customerId"
            element={
              <SellerCustomerlist
                marketplace="flipkart"
              />
            }
          />

          <Route
            path="listings/v3/:sellerId/:customerId"
            element={<ListingsCommonV3Api />}
          />

          <Route
            path="listings"
            element={<ListingsCommonV3Api />}
          />

          <Route
            path="catalog/search"
            element={
              <Placeholder
                name="Flipkart Catalog Search"
              />
            }
          />

          <Route
            path="catalog/products"
            element={
              <Placeholder
                name="Flipkart All Products"
              />
            }
          />

          <Route
            path="inventory"
            element={
              <Placeholder
                name="Flipkart Inventory"
              />
            }
          />

          <Route
            path="orders"
            element={
              <Placeholder
                name="Flipkart Orders"
              />
            }
          />
        </Route>

        {/* ==================================================
            UNIWARE
        ================================================== */}

        <Route
          path="/uniware"
          element={<UniwareLayout />}
        >

          {/* DASHBOARD */}

          <Route
            index
            element={
              <div style={{ padding: 20 }}>
                <h2>
                  Uniware Dashboard - All Modules Loaded
                </h2>

                <p
                  style={{
                    color: "#6b7280",
                  }}
                >
                  Select a module from the navigation above.
                </p>
              </div>
            }
          />

          {/* ==================================================
              AUTH
          ================================================== */}

          <Route
            path="auth"
            element={<UniwareAuth />}
          />

          {/* ==================================================
              FACILITY
          ================================================== */}

          <Route
            path="facility/search"
            element={<SearchFacilities />}
          />

          <Route
            path="facility/details"
            element={<GetFacilityDetails />}
          />

          {/* ==================================================
              EXPORT
          ================================================== */}

          <Route
            path="export/create"
            element={<CreateExportJob />}
          />

          <Route
            path="export/status"
            element={<GetExportJobStatus />}
          />

          {/* ==================================================
              FULFILLMENT
          ================================================== */}

          <Route
            path="fulfillment/manifest/add"
            element={
              <AddShippingPackageToManifest />
            }
          />

          <Route
            path="fulfillment/provider/allocate"
            element={
              <AllocateShippingProvider />
            }
          />

          <Route
            path="fulfillment/serviceability"
            element={
              <CheckServiceability />
            }
          />

          <Route
            path="fulfillment/manifest/close"
            element={
              <CloseShippingManifest />
            }
          />

          <Route
            path="fulfillment/dispatch"
            element={
              <CreateAndDispatchShippingPackage />
            }
          />

          <Route
            path="fulfillment/manifest/complete"
            element={
              <CreateCompleteManifest />
            }
          />

          <Route
            path="fulfillment/invoice"
            element={<CreateInvoice />}
          />

          <Route
            path="fulfillment/invoice/label"
            element={
              <CreateInvoiceAndGenerateLabel />
            }
          />

          <Route
            path="fulfillment/invoice/create-label"
            element={
              <CreateInvoiceAndLabel />
            }
          />

          <Route
            path="fulfillment/invoice/by-so"
            element={
              <CreateInvoiceBySaleOrder />
            }
          />

          {/* ==================================================
              INBOUND
          ================================================== */}

          <Route
            path="inbound/grn/add-item"
            element={<AddGRNItem />}
          />

          <Route
            path="inbound/grn/add-sku"
            element={<AddGRNItemSKU />}
          />

          <Route
            path="inbound/po/approve"
            element={
              <ApprovePurchaseOrder />
            }
          />

          <Route
            path="inbound/po/close"
            element={<ClosePurchaseOrder />}
          />

          <Route
            path="inbound/po/create-approved"
            element={
              <CreateApprovedPurchaseOrder />
            }
          />

          <Route
            path="inbound/grn/create"
            element={<CreateGRN />}
          />

          <Route
            path="inbound/po/create"
            element={
              <CreatePurchaseOrder />
            }
          />

          <Route
            path="inbound/grn/get"
            element={<GetGRN />}
          />

          <Route
            path="inbound/po/details"
            element={
              <GetPurchaseOrderDetails />
            }
          />

          <Route
            path="inbound/grn/search"
            element={<SearchGRNs />}
          />

          <Route
            path="inbound/po/search"
            element={
              <SearchPurchaseOrders />
            }
          />

          <Route
            path="inbound/vendor"
            element={<Vendor />}
          />

          <Route
            path="inbound/vendor/backorder"
            element={
              <VendorBackorderItems />
            }
          />

          <Route
            path="inbound/vendor/item-type"
            element={<VendorItemType />}
          />

          {/* ==================================================
              INVENTORY
          ================================================== */}

          <Route
            path="inventory/adjust-batch-bulk"
            element={
              <AdjustBatchInventoryBulk />
            }
          />

          <Route
            path="inventory/adjust"
            element={<AdjustInventory />}
          />

          <Route
            path="inventory/adjust-bulk"
            element={
              <AdjustInventoryBulk />
            }
          />

          <Route
            path="inventory/snapshot"
            element={
              <InventorySnapshot />
            }
          />

          <Route
            path="inventory/mark-found"
            element={
              <MarkInventoryFound />
            }
          />

          <Route
            path="inventory/nearby"
            element={
              <NearbyStoreInventory />
            }
          />

          {/* ==================================================
              OUTBOUND / GATEPASS
          ================================================== */}

          <Route
            path="outbound/gatepass/add-nontraceable"
            element={
              <AddNonTraceableItem />
            }
          />

          <Route
            path="outbound/gatepass/complete"
            element={
              <CompleteGatepass />
            }
          />

          <Route
            path="outbound/gatepass/create"
            element={
              <CreateGatepass />
            }
          />

          <Route
            path="outbound/gatepass/discard"
            element={
              <DiscardGatepass />
            }
          />

          <Route
            path="outbound/gatepass/get"
            element={<GetGatepass />}
          />

          <Route
            path="outbound/gatepass/remove"
            element={
              <RemoveGatepassItem />
            }
          />

          <Route
            path="outbound/gatepass/scan"
            element={
              <ScanGatepassItem />
            }
          />

          <Route
            path="outbound/gatepass/search"
            element={
              <SearchGatepasses />
            }
          />

          <Route
            path="outbound/gatepass/update"
            element={
              <UpdateGatepass />
            }
          />

          {/* ==================================================
              PRODUCT
          ================================================== */}

          <Route
            path="product/channel-item"
            element={
              <ChannelItemTypeCreateOrEdit />
            }
          />

          <Route
            path="product/category"
            element={
              <CreateOrUpdateCategory />
            }
          />

          <Route
            path="product/item"
            element={
              <CreateOrUpdateItem />
            }
          />

          <Route
            path="product/items"
            element={
              <CreateOrUpdateItems />
            }
          />

          <Route
            path="product/barcode"
            element={
              <GetItemBarcodeDetails />
            }
          />

          <Route
            path="product/details"
            element={
              <GetItemDetails />
            }
          />

          <Route
            path="product/search"
            element={<SearchItems />}
          />

        </Route>

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
}

export default App;