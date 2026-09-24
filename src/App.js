import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// COMMON
import MarketplaceSelector from "./components/Common/MarketplaceSelector";
import Sellerlist from "./components/Common/Sellerlist";
import SellerCustomerlist from "./components/Common/SellerCustomerlist";
import MyStoreDashboard from "./components/MyStore/MyStoreDashboard";
import AddProduct from "./components/MyStore/AddProduct";
import AmazonLayout from "./components/Amazon/AmazonLayout";
import TokenGenerator from "./components/Amazon/Authorization/TokenGenerator";
import AmazonRootRedirect from "./components/Amazon/AmazonRootRedirect";
import CreateListing from "./components/Amazon/ListingsAPIs/CreateListing";
import FlipkartDashboard from "./components/Flipkart/FlipkartDashboard";
import ListingsCommonV3Api from "./components/Flipkart/CatalogAPIs/ListingsCommonV3Api";

// UNIWARE AUTH / FACILITY / EXPORT
import UniwareAuth from "./components/Unicommercece/Authentication/UniwareAuth";
import CreateExportJob from "./components/Unicommercece/EXPORT_JOB/CreateExportJob";
import GetExportJobStatus from "./components/Unicommercece/EXPORT_JOB/GetExportJobStatus";
import SearchFacilities from "./components/Unicommercece/Facility/SearchFacilities";
import GetFacilityDetails from "./components/Unicommercece/Facility/GetFacilityDetails";

// FULFILLMENT - 32
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
import CreateInvoiceWithDetails from "./components/Unicommercece/FULFILLMENT/CreateInvoiceWithDetails";
import CreatePicklist from "./components/Unicommercece/FULFILLMENT/CreatePicklist";
import CreateShippingManifest from "./components/Unicommercece/FULFILLMENT/CreateShippingManifest";
import CreateShippingPackage from "./components/Unicommercece/FULFILLMENT/CreateShippingPackage";
import EnableCustomReasonDropdown from "./components/Unicommercece/FULFILLMENT/EnableCustomReasonDropdown";
import ForceDispatchShippingPackage from "./components/Unicommercece/FULFILLMENT/ForceDispatchShippingPackage";
import GetInvoiceLabel from "./components/Unicommercece/FULFILLMENT/GetInvoiceLabel";
import GetInvoicePdf from "./components/Unicommercece/FULFILLMENT/GetInvoicePdf";
import GetShippingLabelPdf from "./components/Unicommercece/FULFILLMENT/GetShippingLabelPdf";
import GetShippingManifest from "./components/Unicommercece/FULFILLMENT/GetShippingManifest";
import GetShippingPackageDetails from "./components/Unicommercece/FULFILLMENT/GetShippingPackageDetails";
import GetShippingPackages from "./components/Unicommercece/FULFILLMENT/GetShippingPackages";
import MarkDispatchedShippingPackage from "./components/Unicommercece/FULFILLMENT/MarkDispatchedShippingPackage";
import MarkItemDelivered from "./components/Unicommercece/FULFILLMENT/MarkItemDelivered";
import ModifyShippingPackage from "./components/Unicommercece/FULFILLMENT/ModifyShippingPackage";
import SearchShippingPackages from "./components/Unicommercece/FULFILLMENT/SearchShippingPackages";
import SplitShippingPackage from "./components/Unicommercece/FULFILLMENT/SplitShippingPackage";
import UpdateShipmentSealId from "./components/Unicommercece/FULFILLMENT/UpdateShipmentSealId";
import UpdateShipmentSealIdBulk from "./components/Unicommercece/FULFILLMENT/UpdateShipmentSealIdBulk";
import UpdateShippingPackage from "./components/Unicommercece/FULFILLMENT/UpdateShippingPackage";
import UpdateTrackingStatus from "./components/Unicommercece/FULFILLMENT/UpdateTrackingStatus";

// INBOUND
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

// INVENTORY
import AdjustBatchInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustBatchInventoryBulk";
import AdjustInventory from "./components/Unicommercece/INVENTORY/AdjustInventory";
import AdjustInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustInventoryBulk";
import InventorySnapshot from "./components/Unicommercece/INVENTORY/InventorySnapshot";
import MarkInventoryFound from "./components/Unicommercece/INVENTORY/MarkInventoryFound";
import NearbyStoreInventory from "./components/Unicommercece/INVENTORY/NearbyStoreInventory";

// OUTBOUND
import AddNonTraceableItem from "./components/Unicommercece/OUTBOUND/AddNonTraceableItem";
import CompleteGatepass from "./components/Unicommercece/OUTBOUND/CompleteGatepass";
import CreateGatepass from "./components/Unicommercece/OUTBOUND/CreateGatepass";
import DiscardGatepass from "./components/Unicommercece/OUTBOUND/DiscardGatepass";
import GetGatepass from "./components/Unicommercece/OUTBOUND/GetGatepass";
import RemoveGatepassItem from "./components/Unicommercece/OUTBOUND/RemoveGatepassItem";
import ScanGatepassItem from "./components/Unicommercece/OUTBOUND/ScanGatepassItem";
import SearchGatepasses from "./components/Unicommercece/OUTBOUND/SearchGatepasses";
import UpdateGatepass from "./components/Unicommercece/OUTBOUND/UpdateGatepass";

// PRODUCT
import ChannelItemTypeCreateOrEdit from "./components/Unicommercece/PRODUCT/ChannelItemTypeCreateOrEdit";
import CreateOrUpdateCategory from "./components/Unicommercece/PRODUCT/CreateOrUpdateCategory";
import CreateOrUpdateItem from "./components/Unicommercece/PRODUCT/CreateOrUpdateItem";
import CreateOrUpdateItems from "./components/Unicommercece/PRODUCT/CreateOrUpdateItems";
import GetItemBarcodeDetails from "./components/Unicommercece/PRODUCT/GetItemBarcodeDetails";
import GetItemDetails from "./components/Unicommercece/PRODUCT/GetItemDetails";
import SearchItems from "./components/Unicommercece/PRODUCT/SearchItems";

// RETURNS
import AcceptAlternateItem from "./components/Unicommercece/RETURNS/AcceptAlternateItem";
import AllocateReversePickupCourier from "./components/Unicommercece/RETURNS/AllocateReversePickupCourier";
import ApproveReversePickup from "./components/Unicommercece/RETURNS/ApproveReversePickup";
import CancelReversePickup from "./components/Unicommercece/RETURNS/CancelReversePickup";
import CreateAlternateItem from "./components/Unicommercece/RETURNS/CreateAlternateItem";
import CreateReversePickup from "./components/Unicommercece/RETURNS/CreateReversePickup";
import GetReturn from "./components/Unicommercece/RETURNS/GetReturn";
import MarkSaleOrderReturned from "./components/Unicommercece/RETURNS/MarkSaleOrderReturned";
import MarkSaleOrderReturnedInventory from "./components/Unicommercece/RETURNS/MarkSaleOrderReturnedInventory";
import SearchReturns from "./components/Unicommercece/RETURNS/SearchReturns";
import UpdateReversePickup from "./components/Unicommercece/RETURNS/UpdateReversePickup";

// SALE ORDER
import AddSaleOrderItemDetails from "./components/Unicommercece/SALE ORDER/AddSaleOrderItemDetails";
import AddSaleOrderItemDetailsBulk from "./components/Unicommercece/SALE ORDER/AddSaleOrderItemDetailsBulk";
import CancelSaleOrder from "./components/Unicommercece/SALE ORDER/CancelSaleOrder";
import CreateCustomer from "./components/Unicommercece/SALE ORDER/CreateCustomer";
import CreateSaleOrder from "./components/Unicommercece/SALE ORDER/CreateSaleOrder";
import GetSaleOrder from "./components/Unicommercece/SALE ORDER/GetSaleOrder";
import HoldSaleOrder from "./components/Unicommercece/SALE ORDER/HoldSaleOrder";
import HoldSaleOrderItems from "./components/Unicommercece/SALE ORDER/HoldSaleOrderItems";
import SearchSaleOrders from "./components/Unicommercece/SALE ORDER/SearchSaleOrders";
import SetSaleOrderPriority from "./components/Unicommercece/SALE ORDER/SetSaleOrderPriority";
import SwitchFacilitySaleOrderItems from "./components/Unicommercece/SALE ORDER/SwitchFacilitySaleOrderItems";
import UnholdSaleOrder from "./components/Unicommercece/SALE ORDER/UnholdSaleOrder";
import UnholdSaleOrderItems from "./components/Unicommercece/SALE ORDER/UnholdSaleOrderItems";
import UpdateCustomer from "./components/Unicommercece/SALE ORDER/UpdateCustomer";
import UpdateSaleOrder from "./components/Unicommercece/SALE ORDER/UpdateSaleOrder";
import UpdateSaleOrderItemMetadata from "./components/Unicommercece/SALE ORDER/UpdateSaleOrderItemMetadata";
import UpdateSaleOrderMetadata from "./components/Unicommercece/SALE ORDER/UpdateSaleOrderMetadata";
import VerifySaleOrder from "./components/Unicommercece/SALE ORDER/VerifySaleOrder";

// VERTICAL LAYOUTS - THIS IS THE CHANGE
import UniwareLayoutVertical from "./components/Unicommercece/UniwareLayoutVertical";
import UniwareDashboard from "./components/Unicommercece/UniwareDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketplaceSelector />} />
        <Route path="/marketplaces" element={<MarketplaceSelector />} />
        <Route path="/mystore/add-product" element={<AddProduct />} />
        <Route path="/mystore/customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="mystore" />} />
        <Route path="/mystore/*" element={<MyStoreDashboard />} />
        <Route path="/marketplaces/amazon" element={<AmazonLayout />}>
          <Route index element={<AmazonRootRedirect />} />
          <Route path="dashboard" element={<AmazonRootRedirect />} />
          <Route path="auth/token" element={<TokenGenerator />} />
          <Route path="sellers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId" element={<Sellerlist marketplace="amazon" />} />
          <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="amazon" />} />
          <Route path="seller-customers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="amazon" />} />
          <Route path="listings/create" element={<CreateListing />} />
          <Route path="add-product" element={<CreateListing />} />
        </Route>
        <Route path="/marketplaces/flipkart" element={<FlipkartDashboard />}>
          <Route index element={<Sellerlist marketplace="flipkart" />} />
          <Route path="dashboard" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="sellers" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="seller-customers" element={<Sellerlist marketplace="flipkart" />} />
          <Route path="sellers/:sellerId/customers" element={<SellerCustomerlist marketplace="flipkart" />} />
          <Route path="customers/:sellerId/:customerId" element={<SellerCustomerlist marketplace="flipkart" />} />
          <Route path="listings/v3/:sellerId/:customerId" element={<ListingsCommonV3Api />} />
          <Route path="listings" element={<ListingsCommonV3Api />} />
        </Route>

        {/* VERTICAL LAYOUT WITH OPEN/CLOSE */}
        <Route path="/uniware" element={<UniwareLayoutVertical />}>
          <Route index element={<UniwareDashboard />} />
          <Route path="auth" element={<UniwareAuth />} />
          <Route path="facility/search" element={<SearchFacilities />} />
          <Route path="facility/details" element={<GetFacilityDetails />} />
          <Route path="export/create" element={<CreateExportJob />} />
          <Route path="export/status" element={<GetExportJobStatus />} />
          <Route path="fulfillment/manifest/add" element={<AddShippingPackageToManifest />} />
          <Route path="fulfillment/provider/allocate" element={<AllocateShippingProvider />} />
          <Route path="fulfillment/serviceability" element={<CheckServiceability />} />
          <Route path="fulfillment/manifest/close" element={<CloseShippingManifest />} />
          <Route path="fulfillment/dispatch" element={<CreateAndDispatchShippingPackage />} />
          <Route path="fulfillment/dispatch/force" element={<ForceDispatchShippingPackage />} />
          <Route path="fulfillment/manifest/complete" element={<CreateCompleteManifest />} />
          <Route path="fulfillment/invoice" element={<CreateInvoice />} />
          <Route path="fulfillment/invoice/label" element={<CreateInvoiceAndGenerateLabel />} />
          <Route path="fulfillment/invoice/create-label" element={<CreateInvoiceAndLabel />} />
          <Route path="fulfillment/invoice/by-so" element={<CreateInvoiceBySaleOrder />} />
          <Route path="fulfillment/invoice/with-details" element={<CreateInvoiceWithDetails />} />
          <Route path="fulfillment/picklist/create" element={<CreatePicklist />} />
          <Route path="fulfillment/manifest/create" element={<CreateShippingManifest />} />
          <Route path="fulfillment/package/create" element={<CreateShippingPackage />} />
          <Route path="fulfillment/reason-dropdown/enable" element={<EnableCustomReasonDropdown />} />
          <Route path="fulfillment/label/invoice" element={<GetInvoiceLabel />} />
          <Route path="fulfillment/invoice/pdf" element={<GetInvoicePdf />} />
          <Route path="fulfillment/label/pdf" element={<GetShippingLabelPdf />} />
          <Route path="fulfillment/manifest/get" element={<GetShippingManifest />} />
          <Route path="fulfillment/package/details" element={<GetShippingPackageDetails />} />
          <Route path="fulfillment/packages" element={<GetShippingPackages />} />
          <Route path="fulfillment/package/mark-dispatched" element={<MarkDispatchedShippingPackage />} />
          <Route path="fulfillment/package/mark-delivered" element={<MarkItemDelivered />} />
          <Route path="fulfillment/package/modify" element={<ModifyShippingPackage />} />
          <Route path="fulfillment/packages/search" element={<SearchShippingPackages />} />
          <Route path="fulfillment/package/split" element={<SplitShippingPackage />} />
          <Route path="fulfillment/seal/update" element={<UpdateShipmentSealId />} />
          <Route path="fulfillment/seal/bulk-update" element={<UpdateShipmentSealIdBulk />} />
          <Route path="fulfillment/package/update" element={<UpdateShippingPackage />} />
          <Route path="fulfillment/tracking/update" element={<UpdateTrackingStatus />} />
          <Route path="inbound/grn/add-item" element={<AddGRNItem />} />
          <Route path="inbound/grn/add-sku" element={<AddGRNItemSKU />} />
          <Route path="inbound/po/approve" element={<ApprovePurchaseOrder />} />
          <Route path="inbound/po/close" element={<ClosePurchaseOrder />} />
          <Route path="inbound/po/create-approved" element={<CreateApprovedPurchaseOrder />} />
          <Route path="inbound/grn/create" element={<CreateGRN />} />
          <Route path="inbound/po/create" element={<CreatePurchaseOrder />} />
          <Route path="inbound/grn/get" element={<GetGRN />} />
          <Route path="inbound/po/details" element={<GetPurchaseOrderDetails />} />
          <Route path="inbound/grn/search" element={<SearchGRNs />} />
          <Route path="inbound/po/search" element={<SearchPurchaseOrders />} />
          <Route path="inbound/vendor" element={<Vendor />} />
          <Route path="inbound/vendor/backorder" element={<VendorBackorderItems />} />
          <Route path="inbound/vendor/item-type" element={<VendorItemType />} />
          <Route path="inventory/adjust-batch-bulk" element={<AdjustBatchInventoryBulk />} />
          <Route path="inventory/adjust" element={<AdjustInventory />} />
          <Route path="inventory/adjust-bulk" element={<AdjustInventoryBulk />} />
          <Route path="inventory/snapshot" element={<InventorySnapshot />} />
          <Route path="inventory/mark-found" element={<MarkInventoryFound />} />
          <Route path="inventory/nearby" element={<NearbyStoreInventory />} />
          <Route path="outbound/gatepass/add-nontraceable" element={<AddNonTraceableItem />} />
          <Route path="outbound/gatepass/complete" element={<CompleteGatepass />} />
          <Route path="outbound/gatepass/create" element={<CreateGatepass />} />
          <Route path="outbound/gatepass/discard" element={<DiscardGatepass />} />
          <Route path="outbound/gatepass/get" element={<GetGatepass />} />
          <Route path="outbound/gatepass/remove" element={<RemoveGatepassItem />} />
          <Route path="outbound/gatepass/scan" element={<ScanGatepassItem />} />
          <Route path="outbound/gatepass/search" element={<SearchGatepasses />} />
          <Route path="outbound/gatepass/update" element={<UpdateGatepass />} />
          <Route path="product/channel-item" element={<ChannelItemTypeCreateOrEdit />} />
          <Route path="product/category" element={<CreateOrUpdateCategory />} />
          <Route path="product/item" element={<CreateOrUpdateItem />} />
          <Route path="product/items" element={<CreateOrUpdateItems />} />
          <Route path="product/barcode" element={<GetItemBarcodeDetails />} />
          <Route path="product/details" element={<GetItemDetails />} />
          <Route path="product/search" element={<SearchItems />} />
          <Route path="returns/alternate/accept" element={<AcceptAlternateItem />} />
          <Route path="returns/reverse-pickup/allocate" element={<AllocateReversePickupCourier />} />
          <Route path="returns/reverse-pickup/approve" element={<ApproveReversePickup />} />
          <Route path="returns/reverse-pickup/cancel" element={<CancelReversePickup />} />
          <Route path="returns/alternate/create" element={<CreateAlternateItem />} />
          <Route path="returns/reverse-pickup/create" element={<CreateReversePickup />} />
          <Route path="returns/get" element={<GetReturn />} />
          <Route path="returns/mark-returned" element={<MarkSaleOrderReturned />} />
          <Route path="returns/mark-returned-inventory" element={<MarkSaleOrderReturnedInventory />} />
          <Route path="returns/search" element={<SearchReturns />} />
          <Route path="returns/reverse-pickup/update" element={<UpdateReversePickup />} />
          <Route path="saleorder/item/add" element={<AddSaleOrderItemDetails />} />
          <Route path="saleorder/item/add-bulk" element={<AddSaleOrderItemDetailsBulk />} />
          <Route path="saleorder/cancel" element={<CancelSaleOrder />} />
          <Route path="saleorder/customer/create" element={<CreateCustomer />} />
          <Route path="saleorder/create" element={<CreateSaleOrder />} />
          <Route path="saleorder/get" element={<GetSaleOrder />} />
          <Route path="saleorder/hold" element={<HoldSaleOrder />} />
          <Route path="saleorder/items/hold" element={<HoldSaleOrderItems />} />
          <Route path="saleorder/search" element={<SearchSaleOrders />} />
          <Route path="saleorder/priority/set" element={<SetSaleOrderPriority />} />
          <Route path="saleorder/items/switch-facility" element={<SwitchFacilitySaleOrderItems />} />
          <Route path="saleorder/unhold" element={<UnholdSaleOrder />} />
          <Route path="saleorder/items/unhold" element={<UnholdSaleOrderItems />} />
          <Route path="saleorder/customer/update" element={<UpdateCustomer />} />
          <Route path="saleorder/update" element={<UpdateSaleOrder />} />
          <Route path="saleorder/metadata/update" element={<UpdateSaleOrderMetadata />} />
          <Route path="saleorder/item/metadata/update" element={<UpdateSaleOrderItemMetadata />} />
          <Route path="saleorder/verify" element={<VerifySaleOrder />} />
        </Route>

        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

