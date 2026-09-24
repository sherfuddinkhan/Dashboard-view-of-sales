import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetPurchaseOrderDetails = () => {
  const [facility, setFacility] = useState("");
  const [purchaseOrderCode, setPurchaseOrderCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!facility.trim()) {
      setError("Please enter Facility Code.");
      return;
    }

    if (!purchaseOrderCode.trim()) {
      setError("Please enter Purchase Order Code.");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/details`,
        {
          facility: facility.trim(),
          purchaseOrderCode: purchaseOrderCode.trim(),
        }
      );

      const data = result.data;

      setResponse(data);

      if (!data.successful) {
        setError(
          data.message ||
            "Uniware could not fetch the purchase order details."
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch purchase order details."
      );

      setResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFacility("");
    setPurchaseOrderCode("");
    setResponse(null);
    setError("");
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    if (typeof value === "number") {
      return new Date(value).toLocaleString("en-IN");
    }

    return value;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "0.00";
    }

    return Number(value).toFixed(2);
  };

  const getStatusClass = (status) => {
    if (!status) return "po-status";

    return `po-status po-status-${String(status)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Purchase Order Details
            </h1>

            <p style={styles.subtitle}>
              Fetch complete Purchase Order details from Uniware
              using the Purchase Order Code.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>
                  Facility Code *
                </label>

                <input
                  type="text"
                  value={facility}
                  onChange={(e) =>
                    setFacility(e.target.value)
                  }
                  placeholder="Example: MAIN"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Purchase Order Code *
                </label>

                <input
                  type="text"
                  value={purchaseOrderCode}
                  onChange={(e) =>
                    setPurchaseOrderCode(e.target.value)
                  }
                  placeholder="Example: PO0194"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading
                  ? "Loading..."
                  : "Get Purchase Order Details"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <strong>Error</strong>
            <div>{error}</div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div style={styles.results}>
            {/* Success / Message */}
            <div
              style={{
                ...styles.messageBox,
                ...(response.successful
                  ? styles.successBox
                  : styles.errorMessageBox),
              }}
            >
              <strong>
                {response.successful
                  ? "Purchase Order Found"
                  : "Request Failed"}
              </strong>

              {response.message && (
                <div style={{ marginTop: 5 }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* Basic Details */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                Purchase Order Information
              </div>

              <div style={styles.detailsGrid}>
                <Detail
                  label="PO ID"
                  value={response.id}
                />

                <Detail
                  label="PO Code"
                  value={response.code}
                />

                <Detail
                  label="Type"
                  value={response.type}
                />

                <Detail
                  label="Status"
                  value={
                    <span className={getStatusClass(response.statusCode)}>
                      {response.statusCode || "N/A"}
                    </span>
                  }
                />

                <Detail
                  label="From Party"
                  value={response.fromParty}
                />

                <Detail
                  label="Vendor Code"
                  value={response.vendorCode}
                />

                <Detail
                  label="Vendor ID"
                  value={response.vendorId}
                />

                <Detail
                  label="Vendor Name"
                  value={response.vendorName}
                />

                <Detail
                  label="Created By"
                  value={response.createdBy}
                />

                <Detail
                  label="Created"
                  value={formatDate(response.created)}
                />

                <Detail
                  label="Delivery Date"
                  value={formatDate(response.deliveryDate)}
                />

                <Detail
                  label="Expiry Date"
                  value={formatDate(response.expiryDate)}
                />

                <Detail
                  label="Vendor Agreement"
                  value={response.vendorAgreementName}
                />

                <Detail
                  label="GRN / Inflow Receipts"
                  value={response.inflowReceiptsCount}
                />

                <Detail
                  label="Logistic Charges"
                  value={`₹ ${formatNumber(
                    response.logisticCharges
                  )}`}
                />

                <Detail
                  label="TCS Amount"
                  value={`₹ ${formatNumber(
                    response.tcsAmount
                  )}`}
                />

                <Detail
                  label="TCS Addition Enabled"
                  value={
                    response.tcsadditionEnabled
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>

            {/* Address */}
            {response.partyAddressDTO && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Party Address
                </div>

                <div style={styles.addressBox}>
                  <div>
                    <strong>
                      {response.partyAddressDTO.addressTypeName ||
                        response.partyAddressDTO.addressType ||
                        "Address"}
                    </strong>
                  </div>

                  <div>
                    {response.partyAddressDTO.addressLine1 ||
                      "N/A"}
                  </div>

                  {response.partyAddressDTO.addressLine2 && (
                    <div>
                      {response.partyAddressDTO.addressLine2}
                    </div>
                  )}

                  <div>
                    {response.partyAddressDTO.city || "N/A"}
                    {response.partyAddressDTO.stateName
                      ? `, ${response.partyAddressDTO.stateName}`
                      : ""}
                  </div>

                  <div>
                    {response.partyAddressDTO.countryCode ||
                      ""}
                    {" - "}
                    {response.partyAddressDTO.pincode ||
                      "N/A"}
                  </div>

                  <div>
                    Phone:{" "}
                    {response.partyAddressDTO.phone || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {response.purchaseOrderPriceSummary && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Purchase Order Price Summary
                </div>

                <div style={styles.summaryGrid}>
                  <SummaryBox
                    label="Subtotal"
                    value={
                      response.purchaseOrderPriceSummary
                        .subTotalBeforeTaxesAndDiscount
                    }
                  />

                  <SummaryBox
                    label="Discount"
                    value={
                      response.purchaseOrderPriceSummary
                        .discount
                    }
                  />

                  <SummaryBox
                    label="Tax"
                    value={
                      response.purchaseOrderPriceSummary
                        .taxOnSales
                    }
                  />

                  <SummaryBox
                    label="Logistics"
                    value={
                      response.purchaseOrderPriceSummary
                        .logisticCharges
                    }
                  />

                  <SummaryBox
                    label="TCS"
                    value={
                      response.purchaseOrderPriceSummary
                        .tcsAmount
                    }
                  />

                  <SummaryBox
                    label="Total Amount"
                    value={
                      response.purchaseOrderPriceSummary
                        .totalAmount
                    }
                    highlight
                  />

                  <SummaryBox
                    label="Total Items"
                    value={
                      response.purchaseOrderPriceSummary
                        .totalItems
                    }
                    currency={false}
                  />
                </div>
              </div>
            )}

            {/* Purchase Order Items */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                Purchase Order Items
              </div>

              {response.purchaseOrderItems?.length > 0 ? (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>SKU</th>
                        <th style={styles.th}>Item</th>
                        <th style={styles.th}>Vendor SKU</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Rejected</th>
                        <th style={styles.th}>Pending</th>
                        <th style={styles.th}>Unit Price</th>
                        <th style={styles.th}>MRP</th>
                        <th style={styles.th}>Discount</th>
                        <th style={styles.th}>Tax %</th>
                        <th style={styles.th}>Tax</th>
                        <th style={styles.th}>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {response.purchaseOrderItems.map(
                        (item, index) => (
                          <tr key={item.id || index}>
                            <td style={styles.td}>
                              {index + 1}
                            </td>

                            <td style={styles.td}>
                              <strong>
                                {item.itemSKU || "N/A"}
                              </strong>
                            </td>

                            <td style={styles.td}>
                              {item.itemTypeName || "N/A"}
                            </td>

                            <td style={styles.td}>
                              {item.vendorSkuCode || "N/A"}
                            </td>

                            <td style={styles.td}>
                              {item.quantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.rejectedQuantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.pendingQuantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              ₹{" "}
                              {formatNumber(item.unitPrice)}
                            </td>

                            <td style={styles.td}>
                              ₹{" "}
                              {formatNumber(
                                item.maxRetailPrice
                              )}
                            </td>

                            <td style={styles.td}>
                              ₹{" "}
                              {formatNumber(item.discount)}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.taxPercentage
                              )}
                              %
                            </td>

                            <td style={styles.td}>
                              ₹ {formatNumber(item.tax)}
                            </td>

                            <td style={styles.td}>
                              <strong>
                                ₹ {formatNumber(item.total)}
                              </strong>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.empty}>
                  No purchase order items found.
                </div>
              )}
            </div>

            {/* Item Details */}
            {response.purchaseOrderItems?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Item Additional Details
                </div>

                {response.purchaseOrderItems.map(
                  (item, index) => (
                    <div
                      key={item.id || index}
                      style={styles.itemDetail}
                    >
                      <div style={styles.itemDetailTitle}>
                        {index + 1}.{" "}
                        {item.itemSKU || "N/A"} —{" "}
                        {item.itemTypeName || "N/A"}
                      </div>

                      <div style={styles.detailsGrid}>
                        <Detail
                          label="Item Type ID"
                          value={item.itemTypeId}
                        />

                        <Detail
                          label="Color"
                          value={item.color}
                        />

                        <Detail
                          label="Brand"
                          value={item.brand}
                        />

                        <Detail
                          label="Size"
                          value={item.size}
                        />

                        <Detail
                          label="Tax Type"
                          value={item.taxType}
                        />

                        <Detail
                          label="Logistic Charges"
                          value={`₹ ${formatNumber(
                            item.logisticCharges
                          )}`}
                        />

                        <Detail
                          label="Expirable"
                          value={
                            item.expirable ? "Yes" : "No"
                          }
                        />

                        <Detail
                          label="Shelf Life"
                          value={item.shelfLife}
                        />

                        <Detail
                          label="Expiry From"
                          value={item.determineExpiryFrom}
                        />

                        <Detail
                          label="GRN Expiry Tolerance"
                          value={item.grnExpiryTolerance}
                        />

                        <Detail
                          label="Scan Identifier"
                          value={item.scanIdentifier}
                        />

                        <Detail
                          label="Batch Group Code"
                          value={item.batchGroupCode}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Custom Fields */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                Purchase Order Custom Fields
              </div>

              {response.customFieldValues?.length > 0 ? (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Field</th>
                        <th style={styles.th}>Display Name</th>
                        <th style={styles.th}>Value</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Required</th>
                      </tr>
                    </thead>

                    <tbody>
                      {response.customFieldValues.map(
                        (field, index) => (
                          <tr key={index}>
                            <td style={styles.td}>
                              {field.fieldName || "N/A"}
                            </td>

                            <td style={styles.td}>
                              {field.displayName || "N/A"}
                            </td>

                            <td style={styles.td}>
                              {field.fieldValue ?? "N/A"}
                            </td>

                            <td style={styles.td}>
                              {field.valueType || "N/A"}
                            </td>

                            <td style={styles.td}>
                              {field.required ? "Yes" : "No"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.empty}>
                  No custom fields found.
                </div>
              )}
            </div>

            {/* Errors */}
            {response.errors?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Uniware Errors
                </div>

                {response.errors.map((item, index) => (
                  <div key={index} style={styles.errorItem}>
                    <strong>
                      {item.message ||
                        item.description ||
                        "Error"}
                    </strong>

                    {item.fieldName && (
                      <div>
                        Field: {item.fieldName}
                      </div>
                    )}

                    {item.code !== undefined && (
                      <div>
                        Code: {item.code}
                      </div>
                    )}

                    {item.description && (
                      <div>
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {response.warnings?.length > 0 && (
              <div style={styles.card}>
                <div style={styles.sectionHeader}>
                  Uniware Warnings
                </div>

                {response.warnings.map((item, index) => (
                  <div key={index} style={styles.warningItem}>
                    <strong>
                      {item.message ||
                        item.description ||
                        "Warning"}
                    </strong>

                    {item.code !== undefined && (
                      <div>
                        Code: {item.code}
                      </div>
                    )}

                    {item.description && (
                      <div>
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Raw Response */}
            <div style={styles.card}>
              <details>
                <summary style={styles.rawSummary}>
                  View Raw API Response
                </summary>

                <pre style={styles.rawResponse}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={styles.detailItem}>
    <div style={styles.detailLabel}>{label}</div>
    <div style={styles.detailValue}>
      {value === null ||
      value === undefined ||
      value === ""
        ? "N/A"
        : value}
    </div>
  </div>
);

const SummaryBox = ({
  label,
  value,
  highlight = false,
  currency = true,
}) => (
  <div
    style={{
      ...styles.summaryBox,
      ...(highlight ? styles.summaryHighlight : {}),
    }}
  >
    <div style={styles.summaryLabel}>{label}</div>

    <div style={styles.summaryValue}>
      {currency && typeof value === "number"
        ? `₹ ${value.toFixed(2)}`
        : value ?? "0"}
    </div>
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  container: {
    maxWidth: "1500px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#1f2937",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "22px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  primaryButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 600,
  },

  errorBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
  },

  messageBox: {
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
  },

  successBox: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },

  errorMessageBox: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },

  sectionHeader: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "18px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  detailItem: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "7px",
    padding: "12px",
  },

  detailLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: "5px",
    fontWeight: 600,
  },

  detailValue: {
    fontSize: "14px",
    color: "#111827",
    wordBreak: "break-word",
  },

  poStatus: {
    display: "inline-block",
    padding: "4px 9px",
    borderRadius: "20px",
    background: "#e5e7eb",
    fontSize: "12px",
    fontWeight: 700,
  },

  addressBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    lineHeight: 1.7,
    color: "#374151",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },

  summaryBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
  },

  summaryHighlight: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },

  summaryLabel: {
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "6px",
  },

  summaryValue: {
    fontSize: "19px",
    fontWeight: 700,
    color: "#111827",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },

  th: {
    textAlign: "left",
    padding: "11px 10px",
    background: "#f3f4f6",
    borderBottom: "1px solid #d1d5db",
    fontSize: "12px",
    fontWeight: 700,
    color: "#374151",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "11px 10px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  itemDetail: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "18px",
    marginBottom: "15px",
  },

  itemDetailTitle: {
    fontWeight: 700,
    color: "#111827",
    marginBottom: "15px",
  },

  empty: {
    padding: "25px",
    textAlign: "center",
    color: "#6b7280",
  },

  errorItem: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#991b1b",
  },

  warningItem: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "8px",
    color: "#92400e",
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 700,
    color: "#374151",
  },

  rawResponse: {
    background: "#111827",
    color: "#e5e7eb",
    padding: "18px",
    borderRadius: "8px",
    marginTop: "15px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default GetPurchaseOrderDetails;