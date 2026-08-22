import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Store,
  User,
  Package,
  Warehouse,
  Boxes,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Hash,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import "./SellerCustomerlist.css";

const SellerCustomerlist = () => {

  const navigate = useNavigate();

  // =====================================================
  // GET IDs FROM URL
  // =====================================================

  const {
    sellerId,
    customerId
  } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [customer, setCustomer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showProducts, setShowProducts] =
    useState(true);

  const [showInventory, setShowInventory] =
    useState(false);

  const [showWarehouses, setShowWarehouses] =
    useState(false);

  const [showStockLedger, setShowStockLedger] =
    useState(false);

  const [showStockMovement, setShowStockMovement] =
    useState(false);


  // =====================================================
  // FETCH ONLY SELECTED CUSTOMER
  // =====================================================

  const fetchCustomer = async () => {

    if (!sellerId || !customerId) {

      setError(
        "Seller ID and Customer ID are required."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);
      setError("");
      setCustomer(null);

      const url =
        `http://localhost:5000/api/seller-customer/${sellerId}/customers/${customerId}`;

      console.log(
        "Fetching related customer:",
        url
      );

      const response =
        await fetch(url);

      const result =
        await response.json();

      if (!response.ok) {

        throw new Error(
          result.message ||
          "Unable to load customer."
        );

      }

      /*
       * IMPORTANT
       *
       * Your backend may return:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * OR directly:
       *
       * {...}
       *
       * This handles both.
       */

      const customerData =
        result.data ?? result;

      setCustomer(customerData);

    } catch (err) {

      console.error(
        "Seller Customer API Error:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to backend."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD SELECTED CUSTOMER
  // =====================================================

  useEffect(() => {

    fetchCustomer();

  }, [sellerId, customerId]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="seller-customer-page">

        <div className="customer-loading">

          <RefreshCw
            size={28}
            className="seller-spin"
          />

          <h3>
            Loading Customer...
          </h3>

          <p>
            Seller ID: {sellerId}
            {"  "}
            Customer ID: {customerId}
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="seller-customer-page">

        <div className="customer-error">

          <h2>
            Unable to Load Customer
          </h2>

          <p>
            {error}
          </p>

          <p>

            Seller ID:
            <strong>
              {" "}{sellerId}
            </strong>

            {" | "}

            Customer ID:
            <strong>
              {" "}{customerId}
            </strong>

          </p>

          <button
            onClick={fetchCustomer}
          >

            <RefreshCw size={16} />

            Try Again

          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // NO DATA
  // =====================================================

  if (!customer) {

    return (

      <div className="seller-customer-page">

        <div className="customer-error">

          <h2>
            Customer Not Found
          </h2>

          <p>
            No customer was found for:
          </p>

          <strong>
            Seller ID: {sellerId}
            {" | "}
            Customer ID: {customerId}
          </strong>

        </div>

      </div>

    );

  }


  // =====================================================
  // RELATED DATA
  // =====================================================

  const products =
    customer.products || [];

  const inventories =
    customer.inventories || [];

  const warehouses =
    customer.warehouses || [];

  const stockLedgers =
    customer.stockLedgers ||
    customer.stockLedger ||
    [];

  const stockMovements =
    customer.stockMovements ||
    customer.stockMovement ||
    [];


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="seller-customer-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="customer-page-header">

        <div>

          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/marketplaces/amazon/sellers"
              )
            }
          >

            <ArrowLeft size={17} />

            Back to Customers

          </button>

          <div className="customer-title">

            <div className="customer-title-icon">

              <User size={25} />

            </div>

            <div>

              <h1>
                {customer.customerName}
              </h1>

              <p>
                Customer Details
              </p>

            </div>

          </div>

        </div>


        {/* SELECTED IDs */}

        <div className="selected-ids">

          <div>

            <span>
              Seller ID
            </span>

            <strong>
              {sellerId}
            </strong>

          </div>

          <div>

            <span>
              Customer ID
            </span>

            <strong>
              {customerId}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          CUSTOMER INFORMATION
      ================================================= */}

      <div className="customer-info-card">

        <div className="customer-info-header">

          <div>

            <h2>
              Customer Information
            </h2>

            <p>
              Information related only to Seller{" "}
              {sellerId} and Customer{" "}
              {customerId}
            </p>

          </div>

          <div
            className={
              customer.isActive
                ? "customer-status active"
                : "customer-status inactive"
            }
          >

            {customer.isActive
              ? "Active"
              : "Inactive"}

          </div>

        </div>


        <div className="customer-info-grid">

          <InfoItem
            icon={<Store size={17} />}
            label="Seller ID"
            value={customer.sellerId}
          />

          <InfoItem
            icon={<User size={17} />}
            label="Customer ID"
            value={customer.customerId}
          />

          <InfoItem
            icon={<Hash size={17} />}
            label="Customer Code"
            value={customer.customerCode}
          />

          <InfoItem
            icon={<User size={17} />}
            label="Customer Name"
            value={customer.customerName}
          />

          <InfoItem
            icon={<User size={17} />}
            label="Contact Person"
            value={customer.contactPerson}
          />

          <InfoItem
            icon={<Mail size={17} />}
            label="Email"
            value={customer.email}
          />

          <InfoItem
            icon={<Phone size={17} />}
            label="Phone"
            value={customer.phone}
          />

          <InfoItem
            icon={<CreditCard size={17} />}
            label="GSTIN"
            value={customer.gstin}
          />

          <InfoItem
            icon={<MapPin size={17} />}
            label="City"
            value={customer.city}
          />

          <InfoItem
            icon={<MapPin size={17} />}
            label="State"
            value={customer.state}
          />

          <InfoItem
            icon={<CreditCard size={17} />}
            label="Credit Limit"
            value={`₹ ${Number(
              customer.creditLimit || 0
            ).toLocaleString("en-IN")}`}
          />

          <InfoItem
            icon={<MapPin size={17} />}
            label="Country"
            value={customer.country}
          />

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="customer-summary-grid">

        <SummaryCard
          icon={<Package size={21} />}
          title="Products"
          value={products.length}
        />

        <SummaryCard
          icon={<Boxes size={21} />}
          title="Inventory"
          value={inventories.length}
        />

        <SummaryCard
          icon={<Warehouse size={21} />}
          title="Warehouses"
          value={warehouses.length}
        />

        <SummaryCard
          icon={<RefreshCw size={21} />}
          title="Stock Ledger"
          value={stockLedgers.length}
        />

        <SummaryCard
          icon={<RefreshCw size={21} />}
          title="Stock Movements"
          value={stockMovements.length}
        />

      </div>


      {/* =================================================
          PRODUCTS
      ================================================= */}

      <DataSection
        title="Products"
        icon={<Package size={19} />}
        count={products.length}
        open={showProducts}
        onClick={() =>
          setShowProducts(!showProducts)
        }
      >

        {products.length === 0 ? (

          <EmptyState text="No products found for this customer." />

        ) : (

          <div className="data-table-wrapper">

            <table className="customer-data-table">

              <thead>

                <tr>

                  <th>Product ID</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Description</th>

                </tr>

              </thead>

              <tbody>

                {products.map(
                  (product, index) => (

                    <tr
                      key={
                        product.productId ||
                        index
                      }
                    >

                      <td>
                        {product.productId}
                      </td>

                      <td>
                        {product.sku || "-"}
                      </td>

                      <td>
                        <strong>
                          {product.productName || "-"}
                        </strong>
                      </td>

                      <td>
                        {product.description || "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </DataSection>


      {/* =================================================
          INVENTORY
      ================================================= */}

      <DataSection
        title="Inventory"
        icon={<Boxes size={19} />}
        count={inventories.length}
        open={showInventory}
        onClick={() =>
          setShowInventory(!showInventory)
        }
      >

        {inventories.length === 0 ? (

          <EmptyState text="No inventory found for this customer." />

        ) : (

          <div className="data-table-wrapper">

            <table className="customer-data-table">

              <thead>

                <tr>

                  <th>Inventory ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Reserved</th>
                  <th>Damaged</th>

                </tr>

              </thead>

              <tbody>

                {inventories.map(
                  (inventory, index) => (

                    <tr
                      key={
                        inventory.productInventoryId ||
                        index
                      }
                    >

                      <td>
                        {inventory.productInventoryId || "-"}
                      </td>

                      <td>
                        {inventory.productId || "-"}
                      </td>

                      <td>
                        <strong>
                          {inventory.quantity ?? 0}
                        </strong>
                      </td>

                      <td>
                        {inventory.reservedQuantity ?? 0}
                      </td>

                      <td>
                        {inventory.damagedQuantity ?? 0}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </DataSection>


      {/* =================================================
          WAREHOUSES
      ================================================= */}

      <DataSection
        title="Warehouses"
        icon={<Warehouse size={19} />}
        count={warehouses.length}
        open={showWarehouses}
        onClick={() =>
          setShowWarehouses(!showWarehouses)
        }
      >

        {warehouses.length === 0 ? (

          <EmptyState text="No warehouses found for this customer." />

        ) : (

          <div className="data-table-wrapper">

            <table className="customer-data-table">

              <thead>

                <tr>

                  <th>Warehouse ID</th>
                  <th>Code</th>
                  <th>Warehouse</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>

                </tr>

              </thead>

              <tbody>

                {warehouses.map(
                  (warehouse, index) => (

                    <tr
                      key={
                        warehouse.warehouseId ||
                        index
                      }
                    >

                      <td>
                        {warehouse.warehouseId || "-"}
                      </td>

                      <td>
                        {warehouse.warehouseCode || "-"}
                      </td>

                      <td>
                        <strong>
                          {warehouse.warehouseName || "-"}
                        </strong>
                      </td>

                      <td>
                        {warehouse.city || "-"}
                      </td>

                      <td>
                        {warehouse.state || "-"}
                      </td>

                      <td>
                        {warehouse.country || "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </DataSection>


      {/* =================================================
          STOCK LEDGER
      ================================================= */}

      <DataSection
        title="Stock Ledger"
        icon={<RefreshCw size={19} />}
        count={stockLedgers.length}
        open={showStockLedger}
        onClick={() =>
          setShowStockLedger(!showStockLedger)
        }
      >

        {stockLedgers.length === 0 ? (

          <EmptyState text="No stock ledger records found." />

        ) : (

          <div className="data-table-wrapper">

            <table className="customer-data-table">

              <thead>

                <tr>

                  <th>Ledger ID</th>
                  <th>Product ID</th>
                  <th>Warehouse ID</th>
                  <th>Transaction</th>
                  <th>Quantity</th>
                  <th>Balance</th>
                  <th>Reference</th>

                </tr>

              </thead>

              <tbody>

                {stockLedgers.map(
                  (ledger, index) => (

                    <tr
                      key={
                        ledger.stockLedgerId ||
                        index
                      }
                    >

                      <td>
                        {ledger.stockLedgerId || "-"}
                      </td>

                      <td>
                        {ledger.productId || "-"}
                      </td>

                      <td>
                        {ledger.warehouseId || "-"}
                      </td>

                      <td>
                        {ledger.transactionType || "-"}
                      </td>

                      <td>
                        {ledger.quantity ?? 0}
                      </td>

                      <td>
                        <strong>
                          {ledger.balanceQuantity ?? 0}
                        </strong>
                      </td>

                      <td>
                        {ledger.referenceNumber || "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </DataSection>


      {/* =================================================
          STOCK MOVEMENT
      ================================================= */}

      <DataSection
        title="Stock Movement"
        icon={<RefreshCw size={19} />}
        count={stockMovements.length}
        open={showStockMovement}
        onClick={() =>
          setShowStockMovement(
            !showStockMovement
          )
        }
      >

        {stockMovements.length === 0 ? (

          <EmptyState text="No stock movement records found." />

        ) : (

          <div className="data-table-wrapper">

            <table className="customer-data-table">

              <thead>

                <tr>

                  <th>Movement ID</th>
                  <th>Product ID</th>
                  <th>Warehouse ID</th>
                  <th>Movement Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>

                </tr>

              </thead>

              <tbody>

                {stockMovements.map(
                  (movement, index) => (

                    <tr
                      key={
                        movement.stockMovementId ||
                        index
                      }
                    >

                      <td>
                        {movement.stockMovementId || "-"}
                      </td>

                      <td>
                        {movement.productId || "-"}
                      </td>

                      <td>
                        {movement.warehouseId || "-"}
                      </td>

                      <td>
                        {movement.movementType || "-"}
                      </td>

                      <td>
                        {movement.quantity ?? 0}
                      </td>

                      <td>
                        {movement.referenceId || "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </DataSection>

    </div>
  );
};


// =========================================================
// INFO ITEM
// =========================================================

const InfoItem = ({
  icon,
  label,
  value
}) => {

  return (

    <div className="customer-info-item">

      <div className="info-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value || "-"}
        </strong>

      </div>

    </div>

  );
};


// =========================================================
// SUMMARY CARD
// =========================================================

const SummaryCard = ({
  icon,
  title,
  value
}) => {

  return (

    <div className="customer-summary-card">

      <div className="summary-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );
};


// =========================================================
// DATA SECTION
// =========================================================

const DataSection = ({
  title,
  icon,
  count,
  open,
  onClick,
  children
}) => {

  return (

    <div className="customer-data-section">

      <button
        className="data-section-header"
        onClick={onClick}
      >

        <div className="section-title">

          {icon}

          <span>
            {title}
          </span>

          <small>
            {count}
          </small>

        </div>

        {open
          ? <ChevronUp size={19} />
          : <ChevronDown size={19} />}

      </button>


      {open && (

        <div className="data-section-content">

          {children}

        </div>

      )}

    </div>

  );
};


// =========================================================
// EMPTY STATE
// =========================================================

const EmptyState = ({
  text
}) => {

  return (

    <div className="customer-empty">

      <Package size={30} />

      <p>
        {text}
      </p>

    </div>

  );
};


export default SellerCustomerlist;