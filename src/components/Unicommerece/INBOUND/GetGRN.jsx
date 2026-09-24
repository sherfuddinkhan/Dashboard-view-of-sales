import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetGRN = () => {
  const [form, setForm] = useState({
    facility: "",
    inflowReceiptCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearForm = () => {
    setForm({
      facility: "",
      inflowReceiptCode: "",
    });

    setResponse(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!form.facility.trim()) {
      setError("Facility code is required.");
      return;
    }

    if (!form.inflowReceiptCode.trim()) {
      setError("GRN / Inflow Receipt Code is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/grn/details`,
        {
          facility: form.facility.trim(),
          inflowReceiptCode: form.inflowReceiptCode.trim(),
        }
      );

      setResponse(res.data);

      if (res.data?.successful === false) {
        setError(res.data?.message || "Failed to fetch GRN.");
      }
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.error ||
          err.message ||
          "Failed to fetch GRN."
      );

      setResponse(data || null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "0";
    }

    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    return String(value);
  };

  const renderErrors = (errors = []) => {
    if (!errors?.length) return null;

    return (
      <div style={styles.errorBox}>
        <h3 style={styles.errorTitle}>Errors</h3>

        {errors.map((item, index) => (
          <div key={index} style={styles.errorItem}>
            <strong>
              {item.fieldName || "Error"}:
            </strong>{" "}
            {item.message ||
              item.description ||
              "Unknown error"}

            {item.code !== undefined && (
              <span style={styles.code}>
                Code: {item.code}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWarnings = (warnings = []) => {
    if (!warnings?.length) return null;

    return (
      <div style={styles.warningBox}>
        <h3 style={styles.warningTitle}>Warnings</h3>

        {warnings.map((item, index) => (
          <div key={index} style={styles.warningItem}>
            <strong>
              {item.code !== undefined
                ? `Code ${item.code}: `
                : ""}
            </strong>

            {item.message ||
              item.description ||
              "Warning"}
          </div>
        ))}
      </div>
    );
  };

  const grn = response?.inflowReceipt;
  const purchaseOrder = grn?.purchaseOrder;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Get GRN</h1>

            <p style={styles.subtitle}>
              Fetch a Goods Receipt Note from Uniware
              using the Inflow Receipt Code.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            GRN Search
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>
                  Facility Code *
                </label>

                <input
                  type="text"
                  name="facility"
                  value={form.facility}
                  onChange={handleChange}
                  placeholder="Example: MAIN"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  GRN / Inflow Receipt Code *
                </label>

                <input
                  type="text"
                  name="inflowReceiptCode"
                  value={form.inflowReceiptCode}
                  onChange={handleChange}
                  placeholder="Example: GRN0001"
                  style={styles.input}
                />
              </div>
            </div>

            {error && (
              <div style={styles.formError}>
                {error}
              </div>
            )}

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={styles.primaryButton}
              >
                {loading ? "Fetching..." : "Get GRN"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                style={styles.secondaryButton}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Response */}
        {response && (
          <>
            {renderErrors(response.errors)}
            {renderWarnings(response.warnings)}

            {/* Main GRN */}
            {grn && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.sectionTitle}>
                    GRN Details
                  </h2>

                  <span
                    style={{
                      ...styles.status,
                      background:
                        grn.statusCode === "CLOSED"
                          ? "#dcfce7"
                          : "#e0f2fe",
                      color:
                        grn.statusCode === "CLOSED"
                          ? "#166534"
                          : "#0369a1",
                    }}
                  >
                    {getValue(grn.statusCode)}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <InfoItem
                    label="GRN Code"
                    value={grn.code}
                  />

                  <InfoItem
                    label="Status"
                    value={grn.statusCode}
                  />

                  <InfoItem
                    label="Created By"
                    value={grn.createdBy}
                  />

                  <InfoItem
                    label="Created"
                    value={formatDate(grn.created)}
                  />

                  <InfoItem
                    label="Vendor Invoice Number"
                    value={grn.vendorInvoiceNumber}
                  />

                  <InfoItem
                    label="Vendor Invoice Date"
                    value={formatDate(
                      grn.vendorInvoiceDate
                    )}
                  />

                  <InfoItem
                    label="Vendor Code"
                    value={response.vendorCode}
                  />

                  <InfoItem
                    label="Total Quantity"
                    value={grn.totalQuantity}
                  />

                  <InfoItem
                    label="Rejected Quantity"
                    value={grn.totalRejectedQuantity}
                  />

                  <InfoItem
                    label="Received Amount"
                    value={formatNumber(
                      grn.totalReceivedAmount
                    )}
                  />

                  <InfoItem
                    label="Rejected Amount"
                    value={formatNumber(
                      grn.totalRejectedAmount
                    )}
                  />
                </div>
              </div>
            )}

            {/* Purchase Order */}
            {purchaseOrder && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Purchase Order
                </h2>

                <div style={styles.infoGrid}>
                  <InfoItem
                    label="PO Code"
                    value={purchaseOrder.code}
                  />

                  <InfoItem
                    label="From Party"
                    value={purchaseOrder.fromParty}
                  />

                  <InfoItem
                    label="Vendor Code"
                    value={purchaseOrder.vendorCode}
                  />

                  <InfoItem
                    label="Vendor Name"
                    value={purchaseOrder.vendorName}
                  />

                  <InfoItem
                    label="Vendor Agreement"
                    value={
                      purchaseOrder.vendorAgreement
                    }
                  />

                  <InfoItem
                    label="PO Status"
                    value={purchaseOrder.statusCode}
                  />

                  <InfoItem
                    label="Created"
                    value={formatDate(
                      purchaseOrder.created
                    )}
                  />

                  <InfoItem
                    label="Approved"
                    value={formatDate(
                      purchaseOrder.approved
                    )}
                  />

                  <InfoItem
                    label="Delivery Date"
                    value={formatDate(
                      purchaseOrder.deliveryDate
                    )}
                  />

                  <InfoItem
                    label="Expiry Date"
                    value={formatDate(
                      purchaseOrder.expiryDate
                    )}
                  />
                </div>
              </div>
            )}

            {/* GRN Items */}
            {grn?.inflowReceiptItems?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  GRN Items
                </h2>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>
                          SKU
                        </th>
                        <th style={styles.th}>
                          Item
                        </th>
                        <th style={styles.th}>
                          Quantity
                        </th>
                        <th style={styles.th}>
                          Pending
                        </th>
                        <th style={styles.th}>
                          Rejected
                        </th>
                        <th style={styles.th}>
                          Detailed
                        </th>
                        <th style={styles.th}>
                          Unit Price
                        </th>
                        <th style={styles.th}>
                          MRP
                        </th>
                        <th style={styles.th}>
                          Additional Cost
                        </th>
                        <th style={styles.th}>
                          Batch
                        </th>
                        <th style={styles.th}>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {grn.inflowReceiptItems.map(
                        (item, index) => (
                          <tr key={item.id || index}>
                            <td style={styles.td}>
                              {index + 1}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.itemSKU
                              )}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.itemTypeName
                              )}
                            </td>

                            <td style={styles.td}>
                              {item.quantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.pendingQuantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.rejectedQuantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.detailedQuantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.unitPrice
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.maxRetailPrice
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.additionalCost
                              )}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.batchCode
                              )}
                            </td>

                            <td style={styles.td}>
                              {getValue(item.status)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRN Item Details */}
            {grn?.inflowReceiptItems?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  GRN Item Details
                </h2>

                {grn.inflowReceiptItems.map(
                  (item, index) => (
                    <div
                      key={item.id || index}
                      style={styles.itemCard}
                    >
                      <div style={styles.itemHeader}>
                        <strong>
                          {item.itemSKU ||
                            `Item ${index + 1}`}
                        </strong>

                        <span style={styles.itemStatus}>
                          {getValue(item.status)}
                        </span>
                      </div>

                      <div style={styles.infoGrid}>
                        <InfoItem
                          label="Item ID"
                          value={item.id}
                        />

                        <InfoItem
                          label="Purchase Order Item ID"
                          value={
                            item.purchaseOrderItemId
                          }
                        />

                        <InfoItem
                          label="SKU"
                          value={item.itemSKU}
                        />

                        <InfoItem
                          label="Item Name"
                          value={item.itemTypeName}
                        />

                        <InfoItem
                          label="Vendor SKU"
                          value={item.vendorSkuCode}
                        />

                        <InfoItem
                          label="Quantity"
                          value={item.quantity}
                        />

                        <InfoItem
                          label="Pending Quantity"
                          value={
                            item.pendingQuantity
                          }
                        />

                        <InfoItem
                          label="Rejected Quantity"
                          value={
                            item.rejectedQuantity
                          }
                        />

                        <InfoItem
                          label="Detailed Quantity"
                          value={
                            item.detailedQuantity
                          }
                        />

                        <InfoItem
                          label="Items Labelled"
                          value={
                            item.itemsLabelled
                              ? "Yes"
                              : "No"
                          }
                        />

                        <InfoItem
                          label="Unit Price"
                          value={formatNumber(
                            item.unitPrice
                          )}
                        />

                        <InfoItem
                          label="MRP"
                          value={formatNumber(
                            item.maxRetailPrice
                          )}
                        />

                        <InfoItem
                          label="Additional Cost"
                          value={formatNumber(
                            item.additionalCost
                          )}
                        />

                        <InfoItem
                          label="Discount"
                          value={formatNumber(
                            item.discount
                          )}
                        />

                        <InfoItem
                          label="Discount %"
                          value={
                            item.discountPercentage ??
                            0
                          }
                        />

                        <InfoItem
                          label="Batch Code"
                          value={item.batchCode}
                        />

                        <InfoItem
                          label="Manufacturing Date"
                          value={formatDate(
                            item.manufacturingDate
                          )}
                        />

                        <InfoItem
                          label="Expiry"
                          value={formatDate(
                            item.expiry
                          )}
                        />

                        <InfoItem
                          label="Expirable"
                          value={
                            item.expirable
                              ? "Yes"
                              : "No"
                          }
                        />

                        <InfoItem
                          label="Shelf Life"
                          value={item.shelfLife}
                        />

                        <InfoItem
                          label="GRN Expiry Tolerance"
                          value={
                            item.grnExpiryTolerance
                          }
                        />

                        <InfoItem
                          label="Rejection Comments"
                          value={
                            item.rejectionComments
                          }
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Purchase Order Items */}
            {purchaseOrder?.purchaseOrderItems
              ?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Purchase Order Items
                </h2>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>
                          SKU
                        </th>
                        <th style={styles.th}>
                          Item
                        </th>
                        <th style={styles.th}>
                          Vendor SKU
                        </th>
                        <th style={styles.th}>
                          Quantity
                        </th>
                        <th style={styles.th}>
                          Rejected
                        </th>
                        <th style={styles.th}>
                          Pending
                        </th>
                        <th style={styles.th}>
                          Unit Price
                        </th>
                        <th style={styles.th}>
                          MRP
                        </th>
                        <th style={styles.th}>
                          Tax %
                        </th>
                        <th style={styles.th}>
                          Tax
                        </th>
                        <th style={styles.th}>
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchaseOrder.purchaseOrderItems.map(
                        (item, index) => (
                          <tr key={item.id || index}>
                            <td style={styles.td}>
                              {index + 1}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.itemSKU
                              )}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.itemTypeName
                              )}
                            </td>

                            <td style={styles.td}>
                              {getValue(
                                item.vendorSkuCode
                              )}
                            </td>

                            <td style={styles.td}>
                              {item.quantity ?? 0}
                            </td>

                            <td style={styles.td}>
                              {item.rejectedQuantity ??
                                0}
                            </td>

                            <td style={styles.td}>
                              {item.pendingQuantity ??
                                0}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.unitPrice
                              )}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(
                                item.maxRetailPrice
                              )}
                            </td>

                            <td style={styles.td}>
                              {item.taxPercentage ?? 0}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(item.tax)}
                            </td>

                            <td style={styles.td}>
                              {formatNumber(item.total)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRN Custom Fields */}
            {grn?.customFieldValues?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  GRN Custom Fields
                </h2>

                <CustomFields
                  fields={grn.customFieldValues}
                />
              </div>
            )}

            {/* PO Custom Fields */}
            {purchaseOrder?.customFieldValues
              ?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Purchase Order Custom Fields
                </h2>

                <CustomFields
                  fields={
                    purchaseOrder.customFieldValues
                  }
                />
              </div>
            )}

            {/* Raw Response */}
            <div style={styles.card}>
              <details>
                <summary
                  style={styles.rawSummary}
                >
                  View Raw Uniware Response
                </summary>

                <pre style={styles.rawResponse}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => {
  const displayValue =
    value === null ||
    value === undefined ||
    value === ""
      ? "N/A"
      : value;

  return (
    <div style={styles.infoItem}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>
        {displayValue}
      </div>
    </div>
  );
};

const CustomFields = ({ fields = [] }) => {
  return (
    <div style={styles.customGrid}>
      {fields.map((field, index) => (
        <div
          key={index}
          style={styles.customField}
        >
          <div style={styles.infoLabel}>
            {field.displayName ||
              field.fieldName ||
              `Field ${index + 1}`}
          </div>

          <div style={styles.infoValue}>
            {typeof field.fieldValue === "object"
              ? JSON.stringify(
                  field.fieldValue
                )
              : field.fieldValue ?? "N/A"}
          </div>

          <small style={styles.customMeta}>
            Type:{" "}
            {field.valueType || "N/A"}
            {field.required
              ? " • Required"
              : ""}
          </small>
        </div>
      ))}
    </div>
  );
};

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
    fontSize: "30px",
    fontWeight: 700,
    color: "#172033",
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: "0 0 20px",
    fontSize: "20px",
    color: "#172033",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: 600,
    fontSize: "14px",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding: "12px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: 600,
  },

  formError: {
    marginTop: "18px",
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "7px",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: "18px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  errorTitle: {
    marginTop: 0,
    color: "#991b1b",
  },

  errorItem: {
    padding: "8px 0",
    color: "#7f1d1d",
  },

  code: {
    marginLeft: "10px",
    fontSize: "12px",
    color: "#64748b",
  },

  warningBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    padding: "18px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  warningTitle: {
    marginTop: 0,
    color: "#92400e",
  },

  warningItem: {
    padding: "8px 0",
    color: "#78350f",
  },

  status: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 700,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  infoItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
  },

  infoLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    marginBottom: "6px",
  },

  infoValue: {
    fontSize: "14px",
    color: "#0f172a",
    wordBreak: "break-word",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "11px",
    textAlign: "left",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },

  td: {
    border: "1px solid #e2e8f0",
    padding: "11px",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  itemCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "18px",
    marginBottom: "15px",
  },

  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  itemStatus: {
    background: "#f1f5f9",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: 600,
  },

  customGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },

  customField: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
  },

  customMeta: {
    display: "block",
    marginTop: "8px",
    color: "#64748b",
  },

  rawSummary: {
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },

  rawResponse: {
    marginTop: "15px",
    padding: "15px",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "8px",
    overflowX: "auto",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default GetGRN;