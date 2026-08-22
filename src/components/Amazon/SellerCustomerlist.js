import React, { useState } from "react";
import {
  Search,
  Store,
  User,
  Package,
  Warehouse,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import "./SellerCustomerlist.css";

const SellerCustomerlist = () => {
  const [sellerId, setSellerId] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showProducts, setShowProducts] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(false);

  // =========================================================
  // GET CUSTOMER
  // =========================================================

  const handleGetCustomer = async () => {
    if (!sellerId || !customerId) {
      setError("Please enter Seller ID and Customer ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCustomer(null);

      const response = await fetch(
        `http://localhost:5000/api/seller-customer/${sellerId}/customers/${customerId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load customer."
        );
      }

      setCustomer(result.data);

    } catch (err) {
      console.error("Customer API Error:", err);

      setError(
        err.message ||
        "Unable to connect to the backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLEAR
  // =========================================================

  const handleClear = () => {
    setSellerId("");
    setCustomerId("");
    setCustomer(null);
    setError("");
  };

  return (
    <div className="seller-customer-list-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="seller-customer-header">

        <div>
          <h1>Seller Customer</h1>

          <p>
            Search customer information using Seller ID
            and Customer ID.
          </p>
        </div>

      </div>


      {/* =====================================================
          SEARCH CARD
      ====================================================== */}

      <div className="seller-customer-search-card">

        {/* Seller ID */}

        <div className="seller-customer-form-group">

          <label>
            Seller ID
          </label>

          <input
            type="number"
            placeholder="Enter Seller ID"
            value={sellerId}
            onChange={(e) =>
              setSellerId(e.target.value)
            }
          />

        </div>


        {/* Customer ID */}

        <div className="seller-customer-form-group">

          <label>
            Customer ID
          </label>

          <input
            type="number"
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={(e) =>
              setCustomerId(e.target.value)
            }
          />

        </div>


        {/* Get Customer */}

        <button
          className="seller-customer-get-btn"
          onClick={handleGetCustomer}
          disabled={loading}
        >

          <Search size={18} />

          {loading
            ? "Loading..."
            : "Get Customer"}

        </button>


        {/* Clear */}

        <button
          className="seller-customer-clear-btn"
          onClick={handleClear}
        >
          Clear
        </button>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="seller-customer-error">
          {error}
        </div>
      )}


      {/* =====================================================
          CUSTOMER RESULT
      ====================================================== */}

      {customer && (

        <div className="seller-customer-result">

          {/* =================================================
              RESULT HEADER
          ================================================== */}

          <div className="seller-customer-result-header">

            <div>

              <h2>
                Customer Details
              </h2>

              <p>
                {customer.customerName}
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


          {/* =================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="seller-customer-summary-grid">

            {/* Seller ID */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <Store size={21} />
              </div>

              <div>
                <span>
                  Seller ID
                </span>

                <strong>
                  {customer.sellerId}
                </strong>
              </div>

            </div>


            {/* Customer ID */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <User size={21} />
              </div>

              <div>
                <span>
                  Customer ID
                </span>

                <strong>
                  {customer.customerId}
                </strong>
              </div>

            </div>


            {/* Customer Code */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <User size={21} />
              </div>

              <div>
                <span>
                  Customer Code
                </span>

                <strong>
                  {customer.customerCode}
                </strong>
              </div>

            </div>


            {/* Customer Name */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <User size={21} />
              </div>

              <div>
                <span>
                  Customer Name
                </span>

                <strong>
                  {customer.customerName}
                </strong>
              </div>

            </div>


            {/* Products */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <Package size={21} />
              </div>

              <div>
                <span>
                  Products
                </span>

                <strong>
                  {customer.products?.length || 0}
                </strong>
              </div>

            </div>


            {/* Warehouses */}

            <div className="seller-customer-summary-card">

              <div className="seller-customer-summary-icon">
                <Warehouse size={21} />
              </div>

              <div>
                <span>
                  Warehouses
                </span>

                <strong>
                  {customer.warehouses?.length || 0}
                </strong>
              </div>

            </div>

          </div>


          {/* =================================================
              PRODUCTS
          ================================================== */}

          <div className="seller-customer-section">

            <button
              className="seller-customer-section-header"
              onClick={() =>
                setShowProducts(!showProducts)
              }
            >

              <span>
                Products
                <small>
                  {customer.products?.length || 0}
                </small>
              </span>

              {showProducts
                ? <ChevronUp size={19} />
                : <ChevronDown size={19} />}

            </button>


            {showProducts && (

              <div className="seller-customer-section-content">

                {customer.products?.length > 0 ? (

                  customer.products.map((product) => (

                    <div
                      className="seller-customer-detail-row"
                      key={product.productId}
                    >

                      <div>

                        <strong>
                          {product.productName}
                        </strong>

                        <span>
                          SKU: {product.sku}
                        </span>

                      </div>

                      <div>

                        <span>
                          Product ID
                        </span>

                        <strong>
                          {product.productId}
                        </strong>

                      </div>

                    </div>

                  ))

                ) : (

                  <p className="seller-customer-empty">
                    No products found.
                  </p>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              INVENTORY
          ================================================== */}

          <div className="seller-customer-section">

            <button
              className="seller-customer-section-header"
              onClick={() =>
                setShowInventory(!showInventory)
              }
            >

              <span>
                Inventory
                <small>
                  {customer.inventories?.length || 0}
                </small>
              </span>

              {showInventory
                ? <ChevronUp size={19} />
                : <ChevronDown size={19} />}

            </button>


            {showInventory && (

              <div className="seller-customer-section-content">

                {customer.inventories?.length > 0 ? (

                  customer.inventories.map(
                    (inventory) => (

                      <div
                        className="seller-customer-detail-row"
                        key={
                          inventory.productInventoryId
                        }
                      >

                        <div>

                          <span>
                            Product ID
                          </span>

                          <strong>
                            {inventory.productId}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Quantity
                          </span>

                          <strong>
                            {inventory.quantity}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Reserved
                          </span>

                          <strong>
                            {inventory.reservedQuantity}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Damaged
                          </span>

                          <strong>
                            {inventory.damagedQuantity}
                          </strong>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <p className="seller-customer-empty">
                    No inventory found.
                  </p>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              WAREHOUSES
          ================================================== */}

          <div className="seller-customer-section">

            <button
              className="seller-customer-section-header"
              onClick={() =>
                setShowWarehouses(!showWarehouses)
              }
            >

              <span>
                Warehouses
                <small>
                  {customer.warehouses?.length || 0}
                </small>
              </span>

              {showWarehouses
                ? <ChevronUp size={19} />
                : <ChevronDown size={19} />}

            </button>


            {showWarehouses && (

              <div className="seller-customer-section-content">

                {customer.warehouses?.length > 0 ? (

                  customer.warehouses.map(
                    (warehouse) => (

                      <div
                        className="seller-customer-detail-row"
                        key={warehouse.warehouseId}
                      >

                        <div>

                          <strong>
                            {warehouse.warehouseName}
                          </strong>

                          <span>
                            {warehouse.warehouseCode}
                          </span>

                        </div>

                        <div>

                          <span>
                            Location
                          </span>

                          <strong>
                            {warehouse.city},{" "}
                            {warehouse.state}
                          </strong>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <p className="seller-customer-empty">
                    No warehouses found.
                  </p>

                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default SellerCustomerlist;