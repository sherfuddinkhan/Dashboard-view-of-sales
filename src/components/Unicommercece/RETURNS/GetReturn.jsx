import React, {
  useMemo,
  useState,
} from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function GetReturn() {
  const [facility, setFacility] =
    useState("MAIN");

  const [reversePickupCode, setReversePickupCode] =
    useState("");

  const [shipmentCode, setShipmentCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Request Preview
  // --------------------------------------------------
  const requestPreview = useMemo(
    () => ({
      facility,
      reversePickupCode:
        reversePickupCode.trim() || null,
      shipmentCode:
        shipmentCode.trim() || null,
    }),
    [
      facility,
      reversePickupCode,
      shipmentCode,
    ]
  );

  // --------------------------------------------------
  // Clear
  // --------------------------------------------------
  const handleClear = () => {
    setReversePickupCode("");
    setShipmentCode("");
    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!facility.trim()) {
      setError(
        "Facility is required."
      );
      return;
    }

    if (
      !reversePickupCode.trim() &&
      !shipmentCode.trim()
    ) {
      setError(
        "Provide either Reverse Pickup Code or Shipment Code."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          `${SERVER_URL}/api/uniware/returns/get`,
          requestPreview,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      setResult(response.data);
    } catch (err) {
      const apiError =
        err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to get return details."
      );

      setResult(
        apiError || null
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const formatValue = (
    value,
    fallback = "N/A"
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return fallback;
    }

    return String(value);
  };

  const formatDate = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "N/A";
    }

    // Uniware may return epoch milliseconds.
    if (
      typeof value === "number" ||
      /^\d+$/.test(String(value))
    ) {
      const date = new Date(
        Number(value)
      );

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return String(value);
  };

  const items =
    Array.isArray(
      result?.returnSaleOrderItems
    )
      ? result.returnSaleOrderItems
      : [];

  const addresses =
    Array.isArray(
      result?.returnAddressDetailsList
    )
      ? result.returnAddressDetailsList
      : [];

  const customFields =
    Array.isArray(
      result?.customFieldValues
    )
      ? result.customFieldValues
      : [];

  const returnValue =
    result?.returnSaleOrderValue || {};

  const box =
    returnValue?.boxSpecification || {};

  // --------------------------------------------------
  // Styles
  // --------------------------------------------------
  const styles = {
    page: {
      padding: 24,
      maxWidth: 1500,
      margin: "0 auto",
      fontFamily:
        "Arial, Helvetica, sans-serif",
    },

    title: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 6,
    },

    subtitle: {
      color: "#666",
      marginBottom: 24,
    },

    card: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.05)",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 16,
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 16,
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },

    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "#444",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
    },

    buttonRow: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginTop: 20,
    },

    primaryButton: {
      padding: "11px 20px",
      border: "none",
      borderRadius: 6,
      background: "#1976d2",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },

    secondaryButton: {
      padding: "10px 18px",
      border:
        "1px solid #777",
      borderRadius: 6,
      background: "#fff",
      color: "#333",
      cursor: "pointer",
      fontWeight: 600,
    },

    error: {
      padding: 14,
      background: "#ffebee",
      border:
        "1px solid #ef9a9a",
      borderRadius: 6,
      color: "#b71c1c",
      marginBottom: 20,
    },

    success: {
      padding: 14,
      background: "#e8f5e9",
      border:
        "1px solid #a5d6a7",
      borderRadius: 6,
      color: "#1b5e20",
      marginBottom: 20,
    },

    tableWrapper: {
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse:
        "collapse",
      minWidth: 1000,
    },

    th: {
      border:
        "1px solid #ddd",
      padding: 10,
      background: "#f5f5f5",
      textAlign: "left",
      fontSize: 13,
      whiteSpace: "nowrap",
    },

    td: {
      border:
        "1px solid #ddd",
      padding: 10,
      fontSize: 13,
      verticalAlign: "top",
    },

    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: 12,
      background: "#eee",
      fontSize: 12,
      fontWeight: 600,
    },

    pre: {
      background: "#111",
      color: "#eee",
      padding: 16,
      borderRadius: 8,
      overflow: "auto",
      fontSize: 13,
    },

    addressCard: {
      border:
        "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
      background: "#fafafa",
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        Get Return
      </h1>

      <div style={styles.subtitle}>
        Retrieve return item details,
        forward journey information,
        return addresses, shipment
        details, inventory type and
        return information from Uniware.
      </div>

      {/* ------------------------------------------ */}
      {/* Search */}
      {/* ------------------------------------------ */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {result?.successful && (
        <div style={styles.success}>
          <strong>Success:</strong>{" "}
          {result.message ||
            "Return details retrieved successfully."}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
      >
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Return Lookup
          </div>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Facility *
              </label>

              <input
                style={styles.input}
                value={facility}
                onChange={(event) =>
                  setFacility(
                    event.target.value
                  )
                }
                placeholder="MAIN"
              />
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Reverse Pickup Code
              </label>

              <input
                style={styles.input}
                value={
                  reversePickupCode
                }
                onChange={(event) =>
                  setReversePickupCode(
                    event.target.value
                  )
                }
                placeholder="RP0003"
              />
            </div>

            <div style={styles.field}>
              <label
                style={styles.label}
              >
                Shipment Code
              </label>

              <input
                style={styles.input}
                value={shipmentCode}
                onChange={(event) =>
                  setShipmentCode(
                    event.target.value
                  )
                }
                placeholder="VIVE00292"
              />
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Loading Return..."
                : "Get Return"}
            </button>

            <button
              type="button"
              style={
                styles.secondaryButton
              }
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* ------------------------------------------ */}
      {/* Return Summary */}
      {/* ------------------------------------------ */}

      {result &&
        result.successful &&
        returnValue && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Return Summary
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Return Status
                </label>

                <span
                  style={styles.badge}
                >
                  {formatValue(
                    returnValue.returnStatus
                  )}
                </span>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Sale Order Code
                </label>

                <div>
                  {formatValue(
                    returnValue.saleOrderCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Shipment Code
                </label>

                <div>
                  {formatValue(
                    returnValue.shipmentCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Reverse Pickup Code
                </label>

                <div>
                  {formatValue(
                    returnValue.reversePickupCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Tracking Number
                </label>

                <div>
                  {formatValue(
                    returnValue.trackingNumber
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Shipping Provider
                </label>

                <div>
                  {formatValue(
                    returnValue.shippingProviderCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Courier
                </label>

                <div>
                  {formatValue(
                    returnValue.courierName
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Return Created
                </label>

                <div>
                  {formatDate(
                    returnValue.returnCreatedDate
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Channel Return Created
                </label>

                <div>
                  {formatDate(
                    returnValue.channelReturnCreatedDate
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Return Delivery
                </label>

                <div>
                  {formatDate(
                    returnValue.returnDeliveryDate
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Inventory Received
                </label>

                <div>
                  {formatDate(
                    returnValue.inventoryReceivedDate
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Return Completed
                </label>

                <div>
                  {formatDate(
                    returnValue.returnCompletedDate
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Return Invoice / Credit Note
                </label>

                <div>
                  {formatValue(
                    returnValue.returnInvoiceCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Putaway Code
                </label>

                <div>
                  {formatValue(
                    returnValue.putawayCode
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  RTO Tracking Number
                </label>

                <div>
                  {formatValue(
                    returnValue.rtoTrackingNumber
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  RTO Reason
                </label>

                <div>
                  {formatValue(
                    returnValue.rtoReason
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ------------------------------------------ */}
      {/* Box Specification */}
      {/* ------------------------------------------ */}

      {result?.successful &&
        returnValue && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Box Specification
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Length
                </label>
                <div>
                  {formatValue(
                    box.boxLength
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Width
                </label>
                <div>
                  {formatValue(
                    box.boxWidth
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Height
                </label>
                <div>
                  {formatValue(
                    box.boxHeight
                  )}
                </div>
              </div>

              <div style={styles.field}>
                <label
                  style={styles.label}
                >
                  Weight
                </label>
                <div>
                  {formatValue(
                    box.boxWeight
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ------------------------------------------ */}
      {/* Return Items */}
      {/* ------------------------------------------ */}

      {items.length > 0 && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Return Sale Order Items
          </div>

          <div
            style={
              styles.tableWrapper
            }
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    #
                  </th>
                  <th style={styles.th}>
                    SKU
                  </th>
                  <th style={styles.th}>
                    Item Name
                  </th>
                  <th style={styles.th}>
                    Sale Order Item
                  </th>
                  <th style={styles.th}>
                    Sale Order
                  </th>
                  <th style={styles.th}>
                    Channel Product
                  </th>
                  <th style={styles.th}>
                    Shipment
                  </th>
                  <th style={styles.th}>
                    Reverse Pickup
                  </th>
                  <th style={styles.th}>
                    Item Status
                  </th>
                  <th style={styles.th}>
                    Inventory Type
                  </th>
                  <th style={styles.th}>
                    Marketplace Reason
                  </th>
                  <th style={styles.th}>
                    Courier Status
                  </th>
                  <th style={styles.th}>
                    Tracking Status
                  </th>
                  <th style={styles.th}>
                    Return Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (item, index) => (
                    <tr key={index}>
                      <td
                        style={styles.td}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.skuCode
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.itemName
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.saleOrderItemCode
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.saleOrderCode
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.channelProductId
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.shipmentCode
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.reversePickupCode
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.saleOrderItemStatus
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.inventoryType
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.marketplaceReturnReason
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.courierStatus
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.trackingStatus
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          item.returnRemarks
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Return Addresses */}
      {/* ------------------------------------------ */}

      {addresses.length > 0 && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Return Addresses
          </div>

          <div style={styles.grid}>
            {addresses.map(
              (address, index) => (
                <div
                  key={index}
                  style={
                    styles.addressCard
                  }
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {formatValue(
                      address.type
                    )}
                  </div>

                  <div>
                    <strong>
                      Name:
                    </strong>{" "}
                    {formatValue(
                      address.name
                    )}
                  </div>

                  <div>
                    <strong>
                      Address:
                    </strong>{" "}
                    {formatValue(
                      address.addressLine1
                    )}
                  </div>

                  {address.addressLine2 && (
                    <div>
                      <strong>
                        Address 2:
                      </strong>{" "}
                      {
                        address.addressLine2
                      }
                    </div>
                  )}

                  <div>
                    <strong>
                      City:
                    </strong>{" "}
                    {formatValue(
                      address.city
                    )}
                  </div>

                  <div>
                    <strong>
                      State:
                    </strong>{" "}
                    {formatValue(
                      address.state
                    )}
                  </div>

                  <div>
                    <strong>
                      Country:
                    </strong>{" "}
                    {formatValue(
                      address.country
                    )}
                  </div>

                  <div>
                    <strong>
                      Pincode:
                    </strong>{" "}
                    {formatValue(
                      address.pincode
                    )}
                  </div>

                  <div>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {formatValue(
                      address.phone
                    )}
                  </div>

                  <div>
                    <strong>
                      Email:
                    </strong>{" "}
                    {formatValue(
                      address.email
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Custom Fields */}
      {/* ------------------------------------------ */}

      {customFields.length > 0 && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Custom Fields
          </div>

          <div
            style={
              styles.tableWrapper
            }
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Field Name
                  </th>
                  <th style={styles.th}>
                    Display Name
                  </th>
                  <th style={styles.th}>
                    Value
                  </th>
                  <th style={styles.th}>
                    Value Type
                  </th>
                  <th style={styles.th}>
                    Required
                  </th>
                  <th style={styles.th}>
                    Possible Values
                  </th>
                </tr>
              </thead>

              <tbody>
                {customFields.map(
                  (field, index) => (
                    <tr key={index}>
                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          field.fieldName
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          field.displayName
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {field.fieldValue !==
                        undefined
                          ? typeof field.fieldValue ===
                            "object"
                            ? JSON.stringify(
                                field.fieldValue
                              )
                            : String(
                                field.fieldValue
                              )
                          : "N/A"}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {formatValue(
                          field.valueType
                        )}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {field.required
                          ? "Yes"
                          : "No"}
                      </td>

                      <td
                        style={styles.td}
                      >
                        {Array.isArray(
                          field.possibleValues
                        )
                          ? field.possibleValues.join(
                              ", "
                            )
                          : "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Errors / Warnings */}
      {/* ------------------------------------------ */}

      {result &&
        Array.isArray(
          result.errors
        ) &&
        result.errors.length > 0 && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Errors
            </div>

            <div style={styles.error}>
              <ul>
                {result.errors.map(
                  (item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        JSON.stringify(
                          item
                        )}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

      {result &&
        Array.isArray(
          result.warnings
        ) &&
        result.warnings.length > 0 && (
          <div style={styles.card}>
            <div
              style={styles.sectionTitle}
            >
              Warnings
            </div>

            <div
              style={{
                padding: 14,
                background:
                  "#fff8e1",
                border:
                  "1px solid #ffe082",
                borderRadius: 6,
              }}
            >
              <ul>
                {result.warnings.map(
                  (item, index) => (
                    <li key={index}>
                      {item.message ||
                        item.description ||
                        JSON.stringify(
                          item
                        )}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

      {/* ------------------------------------------ */}
      {/* Raw Response */}
      {/* ------------------------------------------ */}

      {result && (
        <div style={styles.card}>
          <div
            style={styles.sectionTitle}
          >
            Raw Response
          </div>

          <pre style={styles.pre}>
            {JSON.stringify(
              result,
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Request Preview */}
      {/* ------------------------------------------ */}

      <div style={styles.card}>
        <div
          style={styles.sectionTitle}
        >
          Request Preview
        </div>

        <pre style={styles.pre}>
          {JSON.stringify(
            requestPreview,
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

export default GetReturn;