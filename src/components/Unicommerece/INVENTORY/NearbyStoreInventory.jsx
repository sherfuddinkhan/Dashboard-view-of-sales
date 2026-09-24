import React, { useMemo, useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const DEFAULT_FORM = {
  customerPincode: "",
  facilitySearchRadius: 50,
  facilityOperationalType: "WAREHOUSE",
  facilityStatus: "ENABLED",
  skuCode: "",
  quantity: 1,
};

const NearbyStoreInventory = () => {
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const customerPincode = form.customerPincode.trim();
    const skuCode = form.skuCode.trim();

    if (!customerPincode) {
      setError("Customer pincode is required.");
      return;
    }

    if (!/^\d{4,10}$/.test(customerPincode)) {
      setError("Please enter a valid customer pincode.");
      return;
    }

    const radius = Number(form.facilitySearchRadius);

    if (!Number.isFinite(radius) || radius <= 0) {
      setError("Facility search radius must be greater than 0.");
      return;
    }

    if (radius > 100) {
      setError("Facility search radius cannot exceed 100 km.");
      return;
    }

    if (!skuCode) {
      setError("SKU code is required.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive integer.");
      return;
    }

    const payload = {
      customerPincode,
      facilitySearchRadius: radius,
      facilityOperationalType: form.facilityOperationalType,
      facilityStatus: form.facilityStatus,
      itemType: {
        skuCode,
        quantity,
      },
    };

    try {
      setLoading(true);

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/inventory/nearby`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      console.error("Nearby inventory error:", err);

      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          apiError?.errors?.[0]?.message ||
          err.message ||
          "Failed to get nearby store inventory."
      );

      setResponse(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(DEFAULT_FORM);
    setResponse(null);
    setError("");
  };

  const facilities = useMemo(() => {
    return (
      response?.facilityWiseNearbyInventorySnapshotDTOList || []
    );
  }, [response]);

  const totalInventory = useMemo(() => {
    return facilities.reduce((total, facility) => {
      return total + Number(facility?.inventorySnapshot?.inventory || 0);
    }, 0);
  }, [facilities]);

  const availableFacilities = useMemo(() => {
    return facilities.filter(
      (facility) => facility?.facilityIsEnabled
    ).length;
  }, [facilities]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1500px",
        margin: "0 auto",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>Get Nearby Store Inventory</h2>

        <p
          style={{
            marginTop: "8px",
            color: "#666",
          }}
        >
          Find inventory for a SKU at nearby warehouses or stores based
          on customer pincode.
        </p>
      </div>

      {/* ======================================================
          SEARCH FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Customer Pincode */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Customer Pincode *
            </label>

            <input
              type="text"
              name="customerPincode"
              value={form.customerPincode}
              onChange={handleChange}
              placeholder="110020"
              maxLength={10}
              style={inputStyle}
            />
          </div>

          {/* Search Radius */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Search Radius (KM) *
            </label>

            <input
              type="number"
              name="facilitySearchRadius"
              value={form.facilitySearchRadius}
              onChange={handleChange}
              min="1"
              max="100"
              step="0.1"
              style={inputStyle}
            />

            <small style={{ color: "#777" }}>
              Maximum supported radius: 100 KM
            </small>
          </div>

          {/* Operational Type */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Facility Operational Type *
            </label>

            <select
              name="facilityOperationalType"
              value={form.facilityOperationalType}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="WAREHOUSE">WAREHOUSE</option>
              <option value="STORE">STORE</option>
              <option value="DARKSTORE">DARKSTORE</option>
              <option value="RETAIL_STORE">RETAIL_STORE</option>
              <option value="FULFILLMENT_CENTER">
                FULFILLMENT_CENTER
              </option>
            </select>
          </div>

          {/* Facility Status */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Facility Status *
            </label>

            <select
              name="facilityStatus"
              value={form.facilityStatus}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="ALL">ALL</option>
              <option value="ENABLED">ENABLED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          {/* SKU */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              SKU Code *
            </label>

            <input
              type="text"
              name="skuCode"
              value={form.skuCode}
              onChange={handleChange}
              placeholder="sj1"
              style={inputStyle}
            />
          </div>

          {/* Quantity */}

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Quantity *
            </label>

            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Buttons */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 20px",
              border: "none",
              borderRadius: "6px",
              background: loading ? "#999" : "#1976d2",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading
              ? "Searching..."
              : "Get Nearby Inventory"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "11px 20px",
              border: "1px solid #bbb",
              borderRadius: "6px",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            background: "#ffebee",
            border: "1px solid #ef9a9a",
            color: "#b71c1c",
            padding: "14px",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ======================================================
          RESPONSE SUMMARY
      ====================================================== */}

      {response && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <SummaryCard
              title="Status"
              value={
                response.successful
                  ? "Successful"
                  : "Failed"
              }
            />

            <SummaryCard
              title="Nearby Facilities"
              value={facilities.length}
            />

            <SummaryCard
              title="Enabled Facilities"
              value={availableFacilities}
            />

            <SummaryCard
              title="Total Inventory"
              value={totalInventory}
            />
          </div>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          {response.message && (
            <div
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <strong>Message:</strong> {response.message}
            </div>
          )}

          {/* ==================================================
              ERRORS
          ================================================== */}

          {response.errors?.length > 0 && (
            <div
              style={{
                background: "#ffebee",
                border: "1px solid #ef9a9a",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ marginTop: 0 }}>Uniware Errors</h4>

              {response.errors.map((item, index) => (
                <div key={index} style={{ marginBottom: "8px" }}>
                  <strong>
                    {item.fieldName || "Error"}:
                  </strong>{" "}
                  {item.message ||
                    item.description ||
                    "Unknown error"}
                </div>
              ))}
            </div>
          )}

          {/* ==================================================
              WARNINGS
          ================================================== */}

          {response.warnings?.length > 0 && (
            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #ffe082",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ marginTop: 0 }}>Warnings</h4>

              {response.warnings.map((item, index) => (
                <div key={index} style={{ marginBottom: "8px" }}>
                  <strong>
                    {item.message || "Warning"}
                  </strong>

                  {item.description && (
                    <div>{item.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ==================================================
              FACILITY TABLE
          ================================================== */}

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Nearby Facility Inventory
              </h3>
            </div>

            {facilities.length === 0 ? (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#777",
                }}
              >
                No nearby facilities found.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1200px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Facility Code</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Display Name</th>
                    <th style={thStyle}>Operational Type</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Facility Pincode</th>
                    <th style={thStyle}>Customer Pincode</th>
                    <th style={thStyle}>Distance (KM)</th>
                    <th style={thStyle}>SKU</th>
                    <th style={thStyle}>Inventory</th>
                    <th style={thStyle}>Virtual Inventory</th>
                    <th style={thStyle}>Slot</th>
                  </tr>
                </thead>

                <tbody>
                  {facilities.map((facility, index) => {
                    const snapshot =
                      facility.inventorySnapshot || {};

                    return (
                      <tr key={`${facility.code}-${index}`}>
                        <td style={tdStyle}>{index + 1}</td>

                        <td style={tdStyle}>
                          <strong>
                            {facility.code || "-"}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {facility.name || "-"}
                        </td>

                        <td style={tdStyle}>
                          {facility.displayName || "-"}
                        </td>

                        <td style={tdStyle}>
                          {facility.operationalType || "-"}
                        </td>

                        <td style={tdStyle}>
                          {facility.type || "-"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 9px",
                              borderRadius: "12px",
                              background:
                                facility.facilityIsEnabled
                                  ? "#e8f5e9"
                                  : "#ffebee",
                              color:
                                facility.facilityIsEnabled
                                  ? "#2e7d32"
                                  : "#c62828",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {facility.facilityIsEnabled
                              ? "ENABLED"
                              : "DISABLED"}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {facility.facilityPincode || "-"}
                        </td>

                        <td style={tdStyle}>
                          {facility.customerPincode || "-"}
                        </td>

                        <td style={tdStyle}>
                          {formatNumber(
                            facility.distanceToCustomerPincode
                          )}
                        </td>

                        <td style={tdStyle}>
                          {snapshot.itemTypeSKU || "-"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            fontWeight: 700,
                          }}
                        >
                          {formatNumber(snapshot.inventory)}
                        </td>

                        <td style={tdStyle}>
                          {formatNumber(
                            snapshot.virtualInventory
                          )}
                        </td>

                        <td style={tdStyle}>
                          {facility.facilitySlotDisplayName ||
                            "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ==================================================
              RAW RESPONSE
          ================================================== */}

          <details style={{ marginTop: "24px" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              View Raw Response
            </summary>

            <pre
              style={{
                marginTop: "10px",
                background: "#1e1e1e",
                color: "#fff",
                padding: "16px",
                borderRadius: "6px",
                overflow: "auto",
                fontSize: "13px",
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
};

// ============================================================
// Helpers
// ============================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "14px",
};

const thStyle = {
  padding: "11px 10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "11px 10px",
  borderBottom: "1px solid #eee",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const SummaryCard = ({ title, value }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "18px",
      background: "#fff",
    }}
  >
    <div
      style={{
        fontSize: "13px",
        color: "#777",
        marginBottom: "8px",
      }}
    >
      {title}
    </div>

    <div
      style={{
        fontSize: "24px",
        fontWeight: 700,
      }}
    >
      {value}
    </div>
  </div>
);

const formatNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  });
};

export default NearbyStoreInventory;