import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EasyEcomLayout from "./components/EasyEcom/EasyEcomLayout";
import EasyEcomDashboard from "./components/EasyEcom/EasyEcomDashboard";

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

import UniwareAuth from "./components/Unicommercece/Authentication/UniwareAuth";
import CreateExportJob from "./components/Unicommercece/EXPORT_JOB/CreateExportJob";
import GetExportJobStatus from "./components/Unicommercece/EXPORT_JOB/GetExportJobStatus";
import SearchFacilities from "./components/Unicommercece/Facility/SearchFacilities";
import GetFacilityDetails from "./components/Unicommercece/Facility/GetFacilityDetails";
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
import AdjustBatchInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustBatchInventoryBulk";
import AdjustInventory from "./components/Unicommercece/INVENTORY/AdjustInventory";
import AdjustInventoryBulk from "./components/Unicommercece/INVENTORY/AdjustInventoryBulk";
import InventorySnapshot from "./components/Unicommercece/INVENTORY/InventorySnapshot";
import MarkInventoryFound from "./components/Unicommercece/INVENTORY/MarkInventoryFound";
import NearbyStoreInventory from "./components/Unicommercece/INVENTORY/NearbyStoreInventory";
import AddNonTraceableItem from "./components/Unicommercece/OUTBOUND/AddNonTraceableItem";
import CompleteGatepass from "./components/Unicommercece/OUTBOUND/CompleteGatepass";
import CreateGatepass from "./components/Unicommercece/OUTBOUND/CreateGatepass";
import DiscardGatepass from "./components/Unicommercece/OUTBOUND/DiscardGatepass";
import GetGatepass from "./components/Unicommercece/OUTBOUND/GetGatepass";
import RemoveGatepassItem from "./components/Unicommercece/OUTBOUND/RemoveGatepassItem";
import ScanGatepassItem from "./components/Unicommercece/OUTBOUND/ScanGatepassItem";
import SearchGatepasses from "./components/Unicommercece/OUTBOUND/SearchGatepasses";
import UpdateGatepass from "./components/Unicommercece/OUTBOUND/UpdateGatepass";
import ChannelItemTypeCreateOrEdit from "./components/Unicommercece/PRODUCT/ChannelItemTypeCreateOrEdit";
import CreateOrUpdateCategory from "./components/Unicommercece/PRODUCT/CreateOrUpdateCategory";
import CreateOrUpdateItem from "./components/Unicommercece/PRODUCT/CreateOrUpdateItem";
import CreateOrUpdateItems from "./components/Unicommercece/PRODUCT/CreateOrUpdateItems";
import GetItemBarcodeDetails from "./components/Unicommercece/PRODUCT/GetItemBarcodeDetails";
import GetItemDetails from "./components/Unicommercece/PRODUCT/GetItemDetails";
import SearchItems from "./components/Unicommercece/PRODUCT/SearchItems";
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
import UniwareLayoutVertical from "./components/Unicommercece/UniwareLayoutVertical";
import UniwareDashboard from "./components/Unicommercece/UniwareDashboard";
import MarketplaceTrafficLiveSync from "./components/Unicommercece/MarketplaceTrafficLiveSync";

// EASYEECOM SAFE IMPORTS
import CheckCompany from "./components/EasyEcom/Aggregators/Check Company/CheckCompany.jsx";
import CreateCompanyV2 from "./components/EasyEcom/Aggregators/Create Client Company V2/CreateCompanyV2.jsx";
import CreateLocation from "./components/EasyEcom/Aggregators/Create Client Location/CreateLocation.jsx";
import AccessToken from "./components/EasyEcom/Authorization/AccessToken.jsx";
import GetAggregatorChildLocation from "./components/EasyEcom/Authorization/GetAggregatorChildLocation.jsx";
import GetChildLocations from "./components/EasyEcom/Authorization/GetChildLocations.jsx";
import CreateCustomerMaster from "./components/EasyEcom/CompanyAndLocations/Create Customer Master/CreateCustomerMaster.jsx";
import CreateVendorMaster from "./components/EasyEcom/CompanyAndLocations/Create Vendor Master/CreateVendorMaster.jsx";
import GetCustomers from "./components/EasyEcom/CompanyAndLocations/Get Customers/GetCustomers.jsx";
import GetLocation from "./components/EasyEcom/CompanyAndLocations/Get Locations/GetLocation.jsx";
import GetVendors from "./components/EasyEcom/CompanyAndLocations/Get Vendors/GetVendors.jsx";
import UpdateCustomerMaster from "./components/EasyEcom/CompanyAndLocations/Update Customer Master/UpdateCustomerMaster.jsx";
import UpdateVendorMaster from "./components/EasyEcom/CompanyAndLocations/Update Vendor Master/UpdateVendorMaster.jsx";
import GetPaymentData from "./components/EasyEcom/ERPAndReconciliation/Get Payment Data/GetPaymentData.jsx";
import GetPaymentDetails from "./components/EasyEcom/ERPAndReconciliation/Get Payment Details/GetPaymentDetails.jsx";
import ReturnOrderERPUpdation from "./components/EasyEcom/ERPAndReconciliation/Return order ERP order updation/ReturnOrderERPUpdation.jsx";
import SalesOrderERPId from "./components/EasyEcom/ERPAndReconciliation/Sales order Erp Id Updation/SalesOrderERPId.jsx";
import CompleteGRNV1 from "./components/EasyEcom/GRN/CompleteGRNV1.jsx";
import GRNDetailV1 from "./components/EasyEcom/GRN/GRNDetailV1.jsx";
import AssignInventoryOldB2B from "./components/EasyEcom/Inventory/Assign Inventory - Old B2B/AssignInventoryOldB2B.jsx";
import QueueGrnApi from "./components/EasyEcom/Inventory/Auto Grn/QueueGrnApi.jsx";
import BulkHoldInventoryUpdate from "./components/EasyEcom/Inventory/Bulk Hold Inventory Update/BulkHoldInventoryUpdate.jsx";
import BulkInventoryUpdate from "./components/EasyEcom/Inventory/Bulk Inventory Update/BulkInventoryUpdate.jsx";
import CreateASN from "./components/EasyEcom/Inventory/Create Asn/CreateASN.jsx";
import GetInventoryDetails from "./components/EasyEcom/Inventory/GetInventoryDetails/GetInventoryDetails.jsx";
import GetInventorySnapshot from "./components/EasyEcom/Inventory/GetInventorySnapshot/GetInventorySnapshot.jsx";
import UnifiedBulkInventoryUpdate from "./components/EasyEcom/Inventory/Unified Bulk Inventory Update/UnifiedBulkInventoryUpdate.jsx";
import UnifiedBulkInventoryUpdateStarter from "./components/EasyEcom/Inventory/Unified Bulk Inventory Update/UnifiedBulkInventoryUpdateStarter.jsx";
import UpdateInventory from "./components/EasyEcom/Inventory/Update Inventory/UpdateInventory.jsx";
import UpdatePoStatus from "./components/EasyEcom/Inventory/UpdatePoStatus/UpdatePoStatus.jsx";
import UpdateVirtualInventory from "./components/EasyEcom/Inventory/Virtual Inventory Update/UpdateVirtualInventory.jsx";
import InventoryAdjustmentV2 from "./components/EasyEcom/Inventory/InventoryAdjustmentV2.jsx";
import AddUser from "./components/EasyEcom/Miscellaneous/Add User/AddUser.jsx";
import GetCompanyGroupDetails from "./components/EasyEcom/Miscellaneous/Get Company Group Details/GetCompanyGroupDetails.jsx";
import GetCountries from "./components/EasyEcom/Miscellaneous/Get Countries/GetCountries.jsx";
import GetCustomFields from "./components/EasyEcom/Miscellaneous/Get Custom Fields/GetCustomFields.jsx";
import GetMarketplaceList from "./components/EasyEcom/Miscellaneous/Get Marketplace List/GetMarketplaceList.jsx";
import GetPaymentAndDeliveryTermDetails from "./components/EasyEcom/Miscellaneous/Get Payment And DeliveryTerm Details/GetPaymentAndDeliveryTermDetails.jsx";
import GetStates from "./components/EasyEcom/Miscellaneous/Get States/GetStates.jsx";
import GetUser from "./components/EasyEcom/Miscellaneous/Get User/GetUser.jsx";
import SwitchSyncStatus from "./components/EasyEcom/Miscellaneous/Switch Sync Status/SwitchSyncStatus.jsx";
import BatchManifestV1 from "./components/EasyEcom/Order/BatchManifestV1/BatchManifestV1.jsx";
import CancelOrderV1 from "./components/EasyEcom/Order/CancelOrderV1/CancelOrderV1.jsx";
import CancelOrderV2 from "./components/EasyEcom/Order/CancelOrderV2/CancelOrderV2.jsx";
import ConfirmOrderV1 from "./components/EasyEcom/Order/ConfirmOrderV1/ConfirmOrderV1.jsx";
import ConfirmOrderV1Start from "./components/EasyEcom/Order/ConfirmOrderV1Start/ConfirmOrderV1Start.jsx";
import ConfirmOrderV2 from "./components/EasyEcom/Order/ConfirmOrderV2/ConfirmOrderV2.jsx";
import ConfirmOrderV2Start from "./components/EasyEcom/Order/ConfirmOrderV2Start/ConfirmOrderV2Start.jsx";
import CreateOrderV1 from "./components/EasyEcom/Order/CreateOrderV1/CreateOrderV1.jsx";
import CreateOrderV2 from "./components/EasyEcom/Order/CreateOrderV2/CreateOrderV2.jsx";
import FetchOrderV1 from "./components/EasyEcom/Order/FetchOrderV1/FetchOrderV1.jsx";
import FetchOrderV2 from "./components/EasyEcom/Order/FetchOrderV2/FetchOrderV2.jsx";
import ManifestedV1 from "./components/EasyEcom/Order/ManifestedV1/ManifestedV1.jsx";
import ManifestedV2 from "./components/EasyEcom/Order/ManifestedV2/ManifestedV2.jsx";
import MarkReturnV1 from "./components/EasyEcom/Order/MarkReturnV1/MarkReturnV1.jsx";
import MarkReturnV2 from "./components/EasyEcom/Order/MarkReturnV2/MarkReturnV2.jsx";
import OrderTrackingV1 from "./components/EasyEcom/Order/OrderTrackingV1/OrderTrackingV1.jsx";
import ReadyToDispatchV1 from "./components/EasyEcom/Order/ReadyToDispatchV1/ReadyToDispatchV1.jsx";
import ReadyToDispatchV2 from "./components/EasyEcom/Order/ReadyToDispatchV2/ReadyToDispatchV2.jsx";
import SalesOrderERPStatus from "./components/EasyEcom/Order/SalesOrderERPStatus/SalesOrderERPStatus.jsx";
import GenerateB2BInvoice from "./components/EasyEcom/orderv2.1/B2B Generate Invoice/GenerateB2BInvoice.jsx";
import B2BOrderApproval from "./components/EasyEcom/orderv2.1/B2B Order Approval/B2BOrderApproval.jsx";
import B2BOrderAssign from "./components/EasyEcom/orderv2.1/B2BOrderAssign/B2BOrderAssign.jsx";
import CancelAndRenameOrder from "./components/EasyEcom/orderv2.1/CancelandrenameOrder/CancelAndRenameOrder.jsx";
import CancelOrderEasy from "./components/EasyEcom/orderv2.1/CancelOrder/CancelOrder.jsx";
import ConfirmOrderEasy from "./components/EasyEcom/orderv2.1/Confirm Order/ConfirmOrder.jsx";
import BusinessOrder from "./components/EasyEcom/orderv2.1/Createorder/BusinessOrder.jsx";
import NewB2BWithoutCustomer from "./components/EasyEcom/orderv2.1/Createorder/NewB2BWithoutCustomer.jsx";
import NewBusinessOrder from "./components/EasyEcom/orderv2.1/Createorder/NewBusinessOrder.jsx";
import NewStockTransferNote from "./components/EasyEcom/orderv2.1/Createorder/NewStockTransferNote.jsx";
import ProductionOrder from "./components/EasyEcom/orderv2.1/Createorder/ProductionOrder.jsx";
import RetailOrder from "./components/EasyEcom/orderv2.1/Createorder/RetailOrder.jsx";
import StockTransferOrder from "./components/EasyEcom/orderv2.1/Createorder/StockTransferOrder.jsx";
import GetDocumentByInvoiceId from "./components/EasyEcom/orderv2.1/Get Documen byinvoiceid/GetDocumentByInvoiceId.jsx";
import GetAllOrders from "./components/EasyEcom/orderv2.1/Getallorders/getAllOrders.jsx";
import GetAllOrdersNextUrl from "./components/EasyEcom/orderv2.1/Getallorders/GetAllOrdersNextUrl.jsx";
import GetOrderCount from "./components/EasyEcom/orderv2.1/GetOrdercount/GetOrderCount.jsx";
import GetOrderDetailsEasy from "./components/EasyEcom/orderv2.1/GetorderDetails/GetOrderDetails.jsx";
import QcConfirmOrder from "./components/EasyEcom/orderv2.1/QCconformOrderbyInvoiceid/QcConfirmOrder.jsx";
import TagLoopMyntraOrders from "./components/EasyEcom/orderv2.1/Tag Loop/TagLoopMyntraOrders.jsx";
import UpdateOrderAddress from "./components/EasyEcom/orderv2.1/UpdateorderAddress/UpdateOrderAddress.jsx";
import CreateMarketplaceListing from "./components/EasyEcom/Product/Create Listing against Marketplace/CreateMarketplaceListing.jsx";
import CreateMasterProduct from "./components/EasyEcom/Product/Create Master Product/CreateMasterProduct.jsx";
import GetKit from "./components/EasyEcom/Product/Get Kit/GetKit.jsx";
import GetMasterProduct from "./components/EasyEcom/Product/Get Master Product/GetMasterProduct.jsx";
import GetProductMastersCount from "./components/EasyEcom/Product/Get Product Masters Count/GetProductMastersCount.jsx";
import ImportListing from "./components/EasyEcom/Product/Import Listing/ImportListing.jsx";
import MapListing from "./components/EasyEcom/Product/Map Listing/MapListing.jsx";
import ActivateDeactivateProduct from "./components/EasyEcom/Product/Product ActivateDeactivate/ActivateDeactivateProduct.jsx";
import UpdateMasterProduct from "./components/EasyEcom/Product/Update Master Product/UpdateMasterProduct.jsx";
import UpdateSKUPrice from "./components/EasyEcom/Product/Update SKU Pricing/UpdateSKUPrice.jsx";
import ConsolidatedInventoryReport from "./components/EasyEcom/Reports/Consolidate Invenotry Report/ConsolidatedInventoryReport.jsx";
import DownloadReport from "./components/EasyEcom/Reports/DownloadReport/DownloadReport.jsx";
import FullInventoryReport from "./components/EasyEcom/Reports/Full Inventory Report/FullInventoryReport.jsx";
import GRNDetailsReport from "./components/EasyEcom/Reports/GRN Details Report/GRNDetailsReport";
import InitiatedReturnReport from "./components/EasyEcom/Reports/Initiated Return Report/InitiatedReturnReport.jsx";
import InventoryAgingReport from "./components/EasyEcom/Reports/Inventory Aging Report/InventoryAgingReport.jsx";
import SerialOutSystemReport from "./components/EasyEcom/Reports/Inventory Aging Report/SerialOutSystemReport.jsx";
import InventoryExpiryReport from "./components/EasyEcom/Reports/Inventory Expiry Report/InventoryExpiryReport.jsx";
import InventoryViewByBin from "./components/EasyEcom/Reports/Inventory View By Bin/InventoryViewByBin.jsx";
import ListReports from "./components/EasyEcom/Reports/ListReports/ListReports.jsx";
import PendingReturnReport from "./components/EasyEcom/Reports/PendingReturnReport/PendingReturnReport.jsx";
import MiniSalesReport from "./components/EasyEcom/Reports/SalesReports/MiniSalesReport.jsx";
import StatusWiseStockReport from "./components/EasyEcom/Reports/StockReports/StatusWiseStockReport.jsx";
import TaxReport from "./components/EasyEcom/Reports/Tax Report/TaxReport.jsx";
import CancelPendingReturn from "./components/EasyEcom/Return/Cancel Pending Return/CancelPendingReturn.jsx";
import DeleteInitiatedReturn from "./components/EasyEcom/Return/Delete Initiated return/DeleteInitiatedReturn.jsx";
import GetAllReturns from "./components/EasyEcom/Return/Get All Returns/GetAllReturns.jsx";
import GetPendingReturns from "./components/EasyEcom/Return/Get Pending Returns/GetPendingReturns.jsx";
import GetReturnDetails from "./components/EasyEcom/Return/Get Return Details/GetReturnDetails.jsx";
import InitiateReturnRVP from "./components/EasyEcom/Return/Initiate Return RVP/InitiateReturnRVP.jsx";
import MarkPendingReturn from "./components/EasyEcom/Return/Mark Pending Return/MarkPendingReturn.jsx";
import MarkReturn from "./components/EasyEcom/Return/Mark Return/MarkReturn.jsx";
import ShipmentAuthentication from "./components/EasyEcom/Shipment/Authentication/Authentication.jsx";
import ShipmentAuthorization from "./components/EasyEcom/Shipment/Authorization/Authorization.jsx";
import CancelShipment from "./components/EasyEcom/Shipment/CancelShipment/CancelShipment.jsx";
import CreateShipment from "./components/EasyEcom/Shipment/CreateShipment/CreateShipment.jsx";
import ListCarrier from "./components/EasyEcom/Shipment/ListCarrier/ListCarrier.jsx";
import EstimatedDeliveryDate from "./components/EasyEcom/Shipmentv2.1/Estimated Delivery Date/EstimatedDeliveryDate.jsx";
import GenerateManifest from "./components/EasyEcom/Shipmentv2.1/Generate Manifest/GenerateManifest.jsx";
import GetTrackingDetails from "./components/EasyEcom/Shipmentv2.1/Get Tracking Details/GetTrackingDetails.jsx";
import ReassignCarrier from "./components/EasyEcom/Shipmentv2.1/Reassign Carrier/ReassignCarrier.jsx";
import UnassignCarrier from "./components/EasyEcom/Shipmentv2.1/Unassign Carrier/UnassignCarrier.jsx";
import UpdateManifestDocument from "./components/EasyEcom/Shipmentv2.1/Update Manifest Document/UpdateManifestDocument.jsx";
import UpdateTrackingStatusV2 from "./components/EasyEcom/Shipmentv2.1/Update Tracking Status/UpdateTrackingStatus.jsx";
import UpdateTrackingStatusB2B from "./components/EasyEcom/Shipmentv2.1/UpdateTrackingStatusB2B/UpdateTrackingStatusB2B.jsx";


// PLACEHOLDERS FOR 8 BROKEN PATHS - NO IMPORT NEEDED
const BulkInventoryUpdateWithBatchCode = () => <div>BulkInventoryUpdateWithBatchCode - fix disk name</div>;
const GetGrnDetails = () => <div>GetGrnDetails - fix disk name</div>;
const EnableDisableAccount = () => <div>EnableDisableAccount - rename Enable/Disable folder</div>;
const GetMarketPlaceListing = () => <div>GetMarketPlaceListing - rename file remove space</div>;
const ValidateMarketplaceCredentials = () => <div>ValidateMarketplaceCredentials - rename folder</div>;
const B2BSaveInvoiceDetails = () => <div>B2BSaveInvoiceDetails - rename OMS B2B folder</div>;
const ReturnReport = () => <div>ReturnReport - rename QC report folder</div>;
const UpdateTrackingStatusEasy = () => <div>UpdateTrackingStatus - check case</div>;
const GetQueueStatus = () => <div>QueueStatus</div>;
const GetPurchaseOrderEasy = () => <div>GetPurchaseOrder</div>;
const GetInventorySerialBySku = () => <div>GetInventorySerialBySku</div>;
const CreatePurchaseOrderEasy = () => <div>CreatePurchaseOrder</div>;

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
          <Route path="auth/token" element={<TokenGenerator />} />
          <Route path="sellers" element={<Sellerlist marketplace="amazon" />} />
          <Route path="listings/create" element={<CreateListing />} />
        </Route>
        <Route path="/marketplaces/flipkart" element={<FlipkartDashboard />}>
          <Route index element={<Sellerlist marketplace="flipkart" />} />
          <Route path="listings" element={<ListingsCommonV3Api />} />
        </Route>
        <Route path="/uniware" element={<UniwareLayoutVertical />}>
          <Route index element={<UniwareDashboard />} />
          <Route path="auth" element={<UniwareAuth />} />
          <Route path="facility/search" element={<SearchFacilities />} />
          <Route path="facility/details" element={<GetFacilityDetails />} />
          <Route path="export/create" element={<CreateExportJob />} />
          <Route path="export/status" element={<GetExportJobStatus />} />
          <Route path="traffic/live" element={<MarketplaceTrafficLiveSync />} />
          <Route path="fulfillment/manifest/add" element={<AddShippingPackageToManifest />} />
          <Route path="fulfillment/provider/allocate" element={<AllocateShippingProvider />} />
          <Route path="fulfillment/serviceability" element={<CheckServiceability />} />
          <Route path="fulfillment/manifest/close" element={<CloseShippingManifest />} />
          <Route path="fulfillment/dispatch" element={<CreateAndDispatchShippingPackage />} />
          <Route path="fulfillment/manifest/complete" element={<CreateCompleteManifest />} />
          <Route path="fulfillment/invoice" element={<CreateInvoice />} />
          <Route path="fulfillment/package/create" element={<CreateShippingPackage />} />
          <Route path="fulfillment/tracking/update" element={<UpdateTrackingStatus />} />
          <Route path="saleorder/create" element={<CreateSaleOrder />} />
          <Route path="saleorder/get" element={<GetSaleOrder />} />
        </Route>
       <Route path="/easyecom" element={<EasyEcomLayout />}>
             <Route index element={<EasyEcomDashboard />} />
          <Route path="check-company" element={<CheckCompany />} />
          <Route path="create-client-company-v2" element={<CreateCompanyV2 />} />
          <Route path="create-client-location" element={<CreateLocation />} />
          <Route path="access-token" element={<AccessToken />} />
          <Route path="get-aggregator-child-location" element={<GetAggregatorChildLocation />} />
          <Route path="get-child-locations" element={<GetChildLocations />} />
          <Route path="create-customer-master" element={<CreateCustomerMaster />} />
          <Route path="create-vendor-master" element={<CreateVendorMaster />} />
          <Route path="get-customers" element={<GetCustomers />} />
          <Route path="get-location" element={<GetLocation />} />
          <Route path="get-vendors" element={<GetVendors />} />
          <Route path="update-customer-master" element={<UpdateCustomerMaster />} />
          <Route path="update-vendor-master" element={<UpdateVendorMaster />} />
          <Route path="get-payment-data" element={<GetPaymentData />} />
          <Route path="get-payment-details" element={<GetPaymentDetails />} />
          <Route path="return-order-erp-updation" element={<ReturnOrderERPUpdation />} />
          <Route path="sales-order-erp-id" element={<SalesOrderERPId />} />
          <Route path="complete-grn-v1" element={<CompleteGRNV1 />} />
          <Route path="grn-detail-v1" element={<GRNDetailV1 />} />
          <Route path="assign-inventory-old-b2b" element={<AssignInventoryOldB2B />} />
          <Route path="queue-grn-api" element={<QueueGrnApi />} />
          <Route path="bulk-hold-inventory-update" element={<BulkHoldInventoryUpdate />} />
          <Route path="bulk-inventory-update" element={<BulkInventoryUpdate />} />
          <Route path="bulk-inventory-update-batch" element={<BulkInventoryUpdateWithBatchCode />} />
          <Route path="create-asn" element={<CreateASN />} />
          <Route path="create-purchase-order" element={<CreatePurchaseOrderEasy />} />
          <Route path="get-grn-details" element={<GetGrnDetails />} />
          <Route path="get-inventory-serial-by-sku" element={<GetInventorySerialBySku />} />
          <Route path="get-purchase-order" element={<GetPurchaseOrderEasy />} />
          <Route path="get-inventory-details" element={<GetInventoryDetails />} />
          <Route path="get-inventory-snapshot" element={<GetInventorySnapshot />} />
          <Route path="unified-bulk-inventory-update" element={<UnifiedBulkInventoryUpdate />} />
          <Route path="unified-bulk-inventory-update-starter" element={<UnifiedBulkInventoryUpdateStarter />} />
          <Route path="update-inventory" element={<UpdateInventory />} />
          <Route path="update-po-status" element={<UpdatePoStatus />} />
          <Route path="update-virtual-inventory" element={<UpdateVirtualInventory />} />
          <Route path="inventory-adjustment-v2" element={<InventoryAdjustmentV2 />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="enable-disable-account" element={<EnableDisableAccount />} />
          <Route path="get-company-group-details" element={<GetCompanyGroupDetails />} />
          <Route path="get-countries" element={<GetCountries />} />
          <Route path="get-custom-fields" element={<GetCustomFields />} />
          <Route path="get-marketplace-list" element={<GetMarketplaceList />} />
          <Route path="get-marketplace-listing" element={<GetMarketPlaceListing />} />
          <Route path="get-payment-delivery-term" element={<GetPaymentAndDeliveryTermDetails />} />
          <Route path="get-queue-status" element={<GetQueueStatus />} />
          <Route path="get-states" element={<GetStates />} />
          <Route path="get-user" element={<GetUser />} />
          <Route path="switch-sync-status" element={<SwitchSyncStatus />} />
          <Route path="validate-marketplace-credentials" element={<ValidateMarketplaceCredentials />} />
          <Route path="batch-manifest-v1" element={<BatchManifestV1 />} />
          <Route path="cancel-order-v1" element={<CancelOrderV1 />} />
          <Route path="cancel-order-v2" element={<CancelOrderV2 />} />
          <Route path="confirm-order-v1" element={<ConfirmOrderV1 />} />
          <Route path="confirm-order-v1-start" element={<ConfirmOrderV1Start />} />
          <Route path="confirm-order-v2" element={<ConfirmOrderV2 />} />
          <Route path="confirm-order-v2-start" element={<ConfirmOrderV2Start />} />
          <Route path="create-order-v1" element={<CreateOrderV1 />} />
          <Route path="create-order-v2" element={<CreateOrderV2 />} />
          <Route path="fetch-order-v1" element={<FetchOrderV1 />} />
          <Route path="fetch-order-v2" element={<FetchOrderV2 />} />
          <Route path="manifested-v1" element={<ManifestedV1 />} />
          <Route path="manifested-v2" element={<ManifestedV2 />} />
          <Route path="mark-return-v1" element={<MarkReturnV1 />} />
          <Route path="mark-return-v2" element={<MarkReturnV2 />} />
          <Route path="order-tracking-v1" element={<OrderTrackingV1 />} />
          <Route path="ready-to-dispatch-v1" element={<ReadyToDispatchV1 />} />
          <Route path="ready-to-dispatch-v2" element={<ReadyToDispatchV2 />} />
          <Route path="sales-order-erp-status" element={<SalesOrderERPStatus />} />
          <Route path="generate-b2b-invoice" element={<GenerateB2BInvoice />} />
          <Route path="b2b-order-approval" element={<B2BOrderApproval />} />
          <Route path="b2b-order-assign" element={<B2BOrderAssign />} />
          <Route path="cancel-rename-order" element={<CancelAndRenameOrder />} />
          <Route path="cancel-order" element={<CancelOrderEasy />} />
          <Route path="confirm-order" element={<ConfirmOrderEasy />} />
          <Route path="business-order" element={<BusinessOrder />} />
          <Route path="new-b2b-without-customer" element={<NewB2BWithoutCustomer />} />
          <Route path="new-business-order" element={<NewBusinessOrder />} />
          <Route path="new-stock-transfer-note" element={<NewStockTransferNote />} />
          <Route path="production-order" element={<ProductionOrder />} />
          <Route path="retail-order" element={<RetailOrder />} />
          <Route path="stock-transfer-order" element={<StockTransferOrder />} />
          <Route path="get-document-by-invoice-id" element={<GetDocumentByInvoiceId />} />
          <Route path="get-all-orders" element={<GetAllOrders />} />
          <Route path="get-all-orders-next-url" element={<GetAllOrdersNextUrl />} />
          <Route path="get-order-count" element={<GetOrderCount />} />
          <Route path="get-order-details" element={<GetOrderDetailsEasy />} />
          <Route path="b2b-save-invoice-details" element={<B2BSaveInvoiceDetails />} />
          <Route path="qc-confirm-order" element={<QcConfirmOrder />} />
          <Route path="tag-loop-myntra-orders" element={<TagLoopMyntraOrders />} />
          <Route path="update-order-address" element={<UpdateOrderAddress />} />
          <Route path="create-listing" element={<CreateMarketplaceListing />} />
          <Route path="create-master-product" element={<CreateMasterProduct />} />
          <Route path="get-kit" element={<GetKit />} />
          <Route path="get-master-product" element={<GetMasterProduct />} />
          <Route path="get-product-masters-count" element={<GetProductMastersCount />} />
          <Route path="import-listing" element={<ImportListing />} />
          <Route path="map-listing" element={<MapListing />} />
          <Route path="activate-deactivate-product" element={<ActivateDeactivateProduct />} />
          <Route path="update-master-product" element={<UpdateMasterProduct />} />
          <Route path="update-sku-price" element={<UpdateSKUPrice />} />
          <Route path="consolidated-inventory-report" element={<ConsolidatedInventoryReport />} />
          <Route path="download-report" element={<DownloadReport />} />
          <Route path="full-inventory-report" element={<FullInventoryReport />} />
          <Route path="grn-details-report" element={<GRNDetailsReport />} />
          <Route path="initiated-return-report" element={<InitiatedReturnReport />} />
          <Route path="inventory-aging-report" element={<InventoryAgingReport />} />
          <Route path="serial-out-system-report" element={<SerialOutSystemReport />} />
          <Route path="inventory-expiry-report" element={<InventoryExpiryReport />} />
          <Route path="inventory-view-by-bin" element={<InventoryViewByBin />} />
          <Route path="list-reports" element={<ListReports />} />
          <Route path="pending-return-report" element={<PendingReturnReport />} />
          <Route path="return-report" element={<ReturnReport />} />
          <Route path="mini-sales-report" element={<MiniSalesReport />} />
          <Route path="status-wise-stock-report" element={<StatusWiseStockReport />} />
          <Route path="tax-report" element={<TaxReport />} />
          <Route path="cancel-pending-return" element={<CancelPendingReturn />} />
          <Route path="delete-initiated-return" element={<DeleteInitiatedReturn />} />
          <Route path="get-all-returns" element={<GetAllReturns />} />
          <Route path="get-pending-returns" element={<GetPendingReturns />} />
          <Route path="get-return-details" element={<GetReturnDetails />} />
          <Route path="initiate-return-rvp" element={<InitiateReturnRVP />} />
          <Route path="mark-pending-return" element={<MarkPendingReturn />} />
          <Route path="mark-return" element={<MarkReturn />} />
          <Route path="authentication" element={<ShipmentAuthentication />} />
          <Route path="authorization" element={<ShipmentAuthorization />} />
          <Route path="cancel-shipment" element={<CancelShipment />} />
          <Route path="create-shipment" element={<CreateShipment />} />
          <Route path="list-carrier" element={<ListCarrier />} />
          <Route path="update-tracking-status" element={<UpdateTrackingStatusEasy />} />
          <Route path="estimated-delivery-date" element={<EstimatedDeliveryDate />} />
          <Route path="generate-manifest" element={<GenerateManifest />} />
          <Route path="get-tracking-details" element={<GetTrackingDetails />} />
          <Route path="reassign-carrier" element={<ReassignCarrier />} />
          <Route path="unassign-carrier" element={<UnassignCarrier />} />
          <Route path="update-manifest-document" element={<UpdateManifestDocument />} />
          <Route path="update-tracking-status-v2" element={<UpdateTrackingStatusV2 />} />
          <Route path="update-tracking-status-b2b" element={<UpdateTrackingStatusB2B />} />
        </Route>
        <Route path="*" element={<Navigate to="/marketplaces" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
