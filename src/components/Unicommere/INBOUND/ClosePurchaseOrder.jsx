import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const ClosePurchaseOrder = () => {
  const [facility, setFacility] = useState("");
  const [purchaseOrderCode, setPurchaseOrderCode] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  // ==========================================================
  // Close Purchase Order
  // ==========================================================

  const handleClose = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!purchaseOrderCode.trim()) {
      setError(
        "Purchase order code is required."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        `${SERVER_URL}/api/uniware/purchase-orders/close`,
        {
          facility: facility.trim(),
          purchaseOrderCode:
            purchaseOrderCode.trim(),
        }
      );

      setResponse(result.data);

      if (!result.data.successful) {
        setError(
          result.data.message ||
            "Purchase order could not be closed."
        );
      }
    } catch (err) {
      console.error(
        "Close Purchase Order Error:",
        err
      );

      const apiError =
        err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to close purchase order."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Clear
  // ==========================================================

  const handleClear = () => {
    setFacility("");
    setPurchaseOrderCode("");
    setResponse(null);
    setError("");
  };

  // ==========================================================
  // Format date
  // ==========================================================

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "25px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2>
        Close Purchase Order
      </h2>

      <p
        style={{
          color: "#666",
          marginBottom: "25px",
        }}
      >
        Close an existing Uniware purchase order
        using its purchase order code.
      </p>

      <form onSubmit={handleClose}>
        {/* ================================================= */}
        {/* Input Section */}
        {/* ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Facility */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "7px",
              }}
            >
              Facility Code *
            </label>

            <input
              type="text"
              value={facility}
              onChange={(e) =>
                setFacility(e.target.value)
              }
              placeholder="Example: MAIN"
              disabled={loading}
              style={inputStyle}
            />

            <small
              style={{
                color: "#777",
              }}
            >
              Enter the facility code configured
              in Uniware.
            </small>
          </div>

          {/* Purchase Order */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "7px",
              }}
            >
              Purchase Order Code *
            </label>

            <input
              type="text"
              value={purchaseOrderCode}
              onChange={(e) =>
                setPurchaseOrderCode(
                  e.target.value
                )
              }
              placeholder="Example: PO0838"
              disabled={loading}
              style={inputStyle}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* Error */}
        {/* ================================================= */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "#ffebee",
              color: "#c62828",
              border:
                "1px solid #ef9a9a",
              borderRadius: "6px",
            }}
          >
            <strong>Error:</strong>{" "}
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* Buttons */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Closing..."
              : "Close Purchase Order"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={secondaryButtonStyle}
          >
            Clear
          </button>
        </div>
      </form>

      {/* ================================================= */}
      {/* Response */}
      {/* ================================================= */}

      {response && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            borderRadius: "8px",
            background:
              response.successful
                ? "#e8f5e9"
                : "#ffebee",
            border:
              response.successful
                ? "1px solid #a5d6a7"
                : "1px solid #ef9a9a",
          }}
        >
          <h3>
            {response.successful
              ? "Purchase Order Closed"
              : "Close Purchase Order Failed"}
          </h3>

          <p>
            <strong>Message:</strong>{" "}
            {response.message ||
              "No message returned"}
          </p>

          {/* ================================================= */}
          {/* Purchase Order Details */}
          {/* ================================================= */}

          {response.purchaseOrder && (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h3>
                Purchase Order Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                <Detail
                  label="Code"
                  value={
                    response.purchaseOrder
                      .code
                  }
                />

                <Detail
                  label="From Party"
                  value={
                    response.purchaseOrder
                      .fromParty
                  }
                />

                <Detail
                  label="Vendor Code"
                  value={
                    response.purchaseOrder
                      .vendorCode
                  }
                />

                <Detail
                  label="Vendor Name"
                  value={
                    response.purchaseOrder
                      .vendorName
                  }
                />

                <Detail
                  label="Vendor Agreement"
                  value={
                    response.purchaseOrder
                      .vendorAgreement
                  }
                />

                <Detail
                  label="Status"
                  value={
                    response.purchaseOrder
                      .statusCode
                  }
                />

                <Detail
                  label="Created"
                  value={formatDate(
                    response.purchaseOrder
                      .created
                  )}
                />

                <Detail
                  label="Approved"
                  value={formatDate(
                    response.purchaseOrder
                      .approved
                  )}
                />

                <Detail
                  label="Delivery Date"
                  value={formatDate(
                    response.purchaseOrder
                      .deliveryDate
                  )}
                />

                <Detail
                  label="Expiry Date"
                  value={formatDate(
                    response.purchaseOrder
                      .expiryDate
                  )}
                />
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Items */}
          {/* ================================================= */}

          {response.purchaseOrder
            ?.purchaseOrderItems?.length >
            0 && (
            <div
              style={{
                marginTop: "30px",
              }}
            >
              <h3>
                Purchase Order Items
              </h3>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "SKU",
                        "Item",
                        "Vendor SKU",
                        "Quantity",
                        "Rejected",
                        "Pending",
                        "Unit Price",
                        "MRP",
                        "Discount",
                        "Tax %",
                        "Tax",
                        "Total",
                      ].map((header) => (
                        <th
                          key={header}
                          style={tableHeaderStyle}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {response.purchaseOrder.purchaseOrderItems.map(
                      (item, index) => (
                        <tr key={index}>
                          <td style={tableCellStyle}>
                            {item.itemSKU ||
                              "N/A"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.itemTypeName ||
                              "N/A"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.vendorSkuCode ||
                              "N/A"}
                          </td>

                          <td style={tableCellStyle}>
                            {item.quantity ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.rejectedQuantity ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.pendingQuantity ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.unitPrice ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.maxRetailPrice ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.discount ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.taxPercentage ??
                              0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.tax ?? 0}
                          </td>

                          <td style={tableCellStyle}>
                            {item.total ?? 0}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* Custom Fields */}
          {/* ================================================= */}

          {response.purchaseOrder
            ?.customFieldValues?.length >
            0 && (
            <div
              style={{
                marginTop: "30px",
              }}
            >
              <h3>
                Custom Fields
              </h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Field
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Value
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Type
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Required
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {response.purchaseOrder.customFieldValues.map(
                    (field, index) => (
                      <tr key={index}>
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {field.displayName ||
                            field.fieldName ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {typeof field.fieldValue ===
                          "object"
                            ? JSON.stringify(
                                field.fieldValue
                              )
                            : field.fieldValue ??
                              "N/A"}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {field.valueType ||
                            "N/A"}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {field.required
                            ? "Yes"
                            : "No"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ================================================= */}
          {/* Errors */}
          {/* ================================================= */}

          {response.errors?.length >
            0 && (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h4>Errors</h4>

              <ul>
                {response.errors.map(
                  (item, index) => (
                    <li key={index}>
                      <strong>
                        {item.fieldName
                          ? `${item.fieldName}: `
                          : ""}
                      </strong>

                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* ================================================= */}
          {/* Warnings */}
          {/* ================================================= */}

          {response.warnings?.length >
            0 && (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h4>Warnings</h4>

              <ul>
                {response.warnings.map(
                  (item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        "Unknown warning"}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Detail Component
// ============================================================

const Detail = ({
  label,
  value,
}) => {
  return (
    <div
      style={{
        padding: "12px",
        background: "#f7f7f7",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#777",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <strong>
        {value || "N/A"}
      </strong>
    </div>
  );
};

// ============================================================
// Styles
// ============================================================

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "12px 22px",
  border: "none",
  borderRadius: "6px",
  background: "#d32f2f",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "12px 22px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
};

const tableHeaderStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  background: "#f5f5f5",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  whiteSpace: "nowrap",
};

export default ClosePurchaseOrder;