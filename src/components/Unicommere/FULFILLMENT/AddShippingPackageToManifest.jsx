import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function AddShippingPackageToManifest() {
  const [form, setForm] = useState({
    shippingManifestCode: "",
  });

  const [shippingPackageCodes, setShippingPackageCodes] =
    useState([""]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Manifest code
  // ----------------------------------------------------------
  const handleManifestChange = (event) => {
    setForm({
      shippingManifestCode: event.target.value,
    });
  };

  // ----------------------------------------------------------
  // Package code
  // ----------------------------------------------------------
  const handlePackageChange = (index, value) => {
    setShippingPackageCodes((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  // ----------------------------------------------------------
  // Add another package
  // ----------------------------------------------------------
  const addPackageCode = () => {
    setShippingPackageCodes((previous) => [
      ...previous,
      "",
    ]);
  };

  // ----------------------------------------------------------
  // Remove package
  // ----------------------------------------------------------
  const removePackageCode = (index) => {
    setShippingPackageCodes((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ----------------------------------------------------------
  // Submit
  // ----------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!form.shippingManifestCode.trim()) {
      setError("Shipping Manifest Code is required.");
      return;
    }

    const cleanedPackageCodes =
      shippingPackageCodes
        .map((code) => code.trim())
        .filter(Boolean);

    if (cleanedPackageCodes.length === 0) {
      setError(
        "At least one Shipping Package Code is required."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        shippingManifestCode:
          form.shippingManifestCode.trim(),

        shippingPackageCodes:
          cleanedPackageCodes,
      };

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/shipping-manifests/add-shipping-package`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          err.message ||
          "Failed to add shipping package(s) to manifest."
      );

      if (data) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // Clear
  // ----------------------------------------------------------
  const handleClear = () => {
    setForm({
      shippingManifestCode: "",
    });

    setShippingPackageCodes([""]);
    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1150px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "26px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "26px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            Add Shipping Package to Manifest
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
              marginBottom: "12px",
            }}
          >
            Add one or more shipping packages to an existing
            Uniware shipping manifest.
          </p>

          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "5px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            TENANT LEVEL — NO FACILITY REQUIRED
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Manifest */}
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>
              Manifest Details
            </h3>

            <label style={labelStyle}>
              Shipping Manifest Code *
            </label>

            <input
              type="text"
              value={form.shippingManifestCode}
              onChange={handleManifestChange}
              placeholder="SM000123"
              style={inputStyle}
            />

            <small style={helpStyle}>
              Enter the manifest code returned by the Create
              Shipping Manifest API.
            </small>
          </div>

          {/* Packages */}
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h3
                  style={{
                    ...sectionTitle,
                    marginBottom: "5px",
                  }}
                >
                  Shipping Packages
                </h3>

                <small style={helpStyle}>
                  Add the shipping package codes to be included
                  in this manifest.
                </small>
              </div>

              <button
                type="button"
                onClick={addPackageCode}
                style={addButtonStyle}
              >
                + Add Package
              </button>
            </div>

            {shippingPackageCodes.map(
              (packageCode, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "35px",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    {index + 1}.
                  </div>

                  <input
                    type="text"
                    value={packageCode}
                    onChange={(event) =>
                      handlePackageChange(
                        index,
                        event.target.value
                      )
                    }
                    placeholder="SP000123"
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                  />

                  {shippingPackageCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removePackageCode(index)
                      }
                      style={removeButtonStyle}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 22px",
                border: "none",
                borderRadius: "7px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: 600,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Adding Packages..."
                : "Add Packages to Manifest"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={clearButtonStyle}
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <ManifestResult result={result} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Result component
// ============================================================

function ManifestResult({ result }) {
  const manifestItems = Array.isArray(
    result.manifestItems
  )
    ? result.manifestItems
    : [];

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Manifest Package Result</h3>

      {/* Status */}
      <div
        style={{
          padding: "18px",
          borderRadius: "8px",
          background: result.successful
            ? "#f0fdf4"
            : "#fef2f2",
          border: `1px solid ${
            result.successful
              ? "#bbf7d0"
              : "#fecaca"
          }`,
        }}
      >
        <div>
          <strong>Status: </strong>

          <span
            style={{
              fontWeight: 700,
              color: result.successful
                ? "#15803d"
                : "#b91c1c",
            }}
          >
            {result.successful
              ? "SUCCESS"
              : "FAILED"}
          </span>
        </div>

        <div style={{ marginTop: "8px" }}>
          <strong>Message:</strong>{" "}
          {result.message || "N/A"}
        </div>
      </div>

      {/* Manifest information */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <ResultCard
          label="Manifest Code"
          value={result.shippingManifestCode}
        />

        <ResultCard
          label="Packages Added"
          value={manifestItems.length}
        />
      </div>

      {/* Package table */}
      {manifestItems.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <h4>Manifest Items</h4>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1200px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Shipping Package
                  </th>

                  <th style={thStyle}>
                    Package Status
                  </th>

                  <th style={thStyle}>
                    Invoice
                  </th>

                  <th style={thStyle}>
                    Tracking Number
                  </th>

                  <th style={thStyle}>
                    Quantity
                  </th>

                  <th style={thStyle}>
                    Boxes
                  </th>

                  <th style={thStyle}>
                    Weight
                  </th>

                  <th style={thStyle}>
                    Total Amount
                  </th>

                  <th style={thStyle}>
                    Shipping Charges
                  </th>

                  <th style={thStyle}>
                    Collectable
                  </th>

                  <th style={thStyle}>
                    Shipping Method
                  </th>

                  <th style={thStyle}>
                    Order Code
                  </th>

                  <th style={thStyle}>
                    COD
                  </th>

                  <th style={thStyle}>
                    Provider
                  </th>
                </tr>
              </thead>

              <tbody>
                {manifestItems.map(
                  (item, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>
                        {item.shippingPackageCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingPackageStatusCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.invoiceDisplayCode ||
                          item.invoiceCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.trackingNumber ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.quantity ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.noOfBoxes ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.weight ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.totalAmount ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingCharges ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.collectableAmount ?? "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingMethod ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.displayOrderCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {item.cashOnDelivery ===
                        undefined
                          ? "N/A"
                          : item.cashOnDelivery
                            ? "Yes"
                            : "No"}
                      </td>

                      <td style={tdStyle}>
                        {item.shippingProviderName ||
                          item.shippingProviderCode ||
                          "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Detailed packages */}
          {manifestItems.map(
            (item, index) => (
              <PackageDetails
                key={index}
                item={item}
                index={index}
              />
            )
          )}
        </div>
      )}

      {/* Errors */}
      {Array.isArray(result.errors) &&
        result.errors.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ marginTop: 0 }}>
              Uniware Errors
            </h4>

            {result.errors.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    paddingBottom: "12px",
                    marginBottom: "12px",
                    borderBottom:
                      "1px solid #fee2e2",
                  }}
                >
                  <div>
                    <strong>
                      Code:
                    </strong>{" "}
                    {item.code ?? "N/A"}
                  </div>

                  <div>
                    <strong>
                      Field:
                    </strong>{" "}
                    {item.fieldName ||
                      "N/A"}
                  </div>

                  <div>
                    <strong>
                      Message:
                    </strong>{" "}
                    {item.message ||
                      item.description ||
                      "N/A"}
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {/* Warnings */}
      {Array.isArray(result.warnings) &&
        result.warnings.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
            }}
          >
            <h4 style={{ marginTop: 0 }}>
              Uniware Warnings
            </h4>

            {result.warnings.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  <strong>
                    {item.code ??
                      "Warning"}
                    :
                  </strong>{" "}
                  {item.message ||
                    item.description ||
                    "N/A"}
                </div>
              )
            )}
          </div>
        )}

      {/* Raw response */}
      <details style={{ marginTop: "20px" }}>
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Raw Uniware Response
        </summary>

        <pre
          style={{
            marginTop: "12px",
            padding: "16px",
            background: "#111827",
            color: "#e5e7eb",
            borderRadius: "8px",
            overflowX: "auto",
            fontSize: "13px",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
}

// ============================================================
// Package Details
// ============================================================

function PackageDetails({ item, index }) {
  const address = item.shippingAddress || {};
  const packageType = item.shippingPackageType || {};
  const lineItems = Array.isArray(
    item.manifestLineItems
  )
    ? item.manifestLineItems
    : [];

  return (
    <details
      style={{
        marginTop: "15px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "14px",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Package {index + 1}:{" "}
        {item.shippingPackageCode || "N/A"}
      </summary>

      {/* Address */}
      <div style={{ marginTop: "18px" }}>
        <h4>Shipping Address</h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          <ResultCard
            label="Name"
            value={address.name}
          />

          <ResultCard
            label="Address Line 1"
            value={address.addressLine1}
          />

          <ResultCard
            label="Address Line 2"
            value={address.addressLine2}
          />

          <ResultCard
            label="City"
            value={address.city}
          />

          <ResultCard
            label="State"
            value={address.state}
          />

          <ResultCard
            label="Pincode"
            value={address.pincode}
          />

          <ResultCard
            label="Phone"
            value={address.phone}
          />
        </div>
      </div>

      {/* Package type */}
      <div style={{ marginTop: "20px" }}>
        <h4>Shipping Package Type</h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <ResultCard
            label="Code"
            value={packageType.code}
          />

          <ResultCard
            label="Length (mm)"
            value={packageType.boxLength}
          />

          <ResultCard
            label="Width (mm)"
            value={packageType.boxWidth}
          />

          <ResultCard
            label="Height (mm)"
            value={packageType.boxHeight}
          />

          <ResultCard
            label="Box Weight"
            value={packageType.boxWeight}
          />

          <ResultCard
            label="Packing Cost"
            value={packageType.packingCost}
          />

          <ResultCard
            label="Enabled"
            value={
              packageType.enabled ===
              undefined
                ? "N/A"
                : packageType.enabled
                  ? "Yes"
                  : "No"
            }
          />

          <ResultCard
            label="Editable"
            value={
              packageType.editable ===
              undefined
                ? "N/A"
                : packageType.editable
                  ? "Yes"
                  : "No"
            }
          />
        </div>
      </div>

      {/* Line items */}
      {lineItems.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Manifest Line Items</h4>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Line Item Identifier
                  </th>

                  <th style={thStyle}>
                    Item Name
                  </th>

                  <th style={thStyle}>
                    Seller SKU
                  </th>

                  <th style={thStyle}>
                    Quantity
                  </th>
                </tr>
              </thead>

              <tbody>
                {lineItems.map(
                  (lineItem, lineIndex) => (
                    <tr key={lineIndex}>
                      <td style={tdStyle}>
                        {lineItem.lineItemIdentifier ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {lineItem.itemName ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {lineItem.sellerSkuCode ||
                          "N/A"}
                      </td>

                      <td style={tdStyle}>
                        {lineItem.quantity ??
                          0}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </details>
  );
}

// ============================================================
// Result Card
// ============================================================

function ResultCard({ label, value }) {
  return (
    <div
      style={{
        padding: "13px",
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "7px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : value}
      </div>
    </div>
  );
}

// ============================================================
// Styles
// ============================================================

const sectionStyle = {
  marginBottom: "24px",
  padding: "20px",
  border: "1px solid #e5e7eb",
  borderRadius: "9px",
  background: "#fafafa",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  fontSize: "14px",
};

const helpStyle = {
  display: "block",
  color: "#6b7280",
  fontSize: "12px",
};

const addButtonStyle = {
  padding: "9px 15px",
  border: "1px solid #2563eb",
  borderRadius: "6px",
  background: "#fff",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};

const removeButtonStyle = {
  padding: "9px 13px",
  border: "1px solid #dc2626",
  borderRadius: "6px",
  background: "#fff",
  color: "#dc2626",
  cursor: "pointer",
};

const clearButtonStyle = {
  padding: "12px 22px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const thStyle = {
  textAlign: "left",
  padding: "11px",
  background: "#f3f4f6",
  borderBottom: "1px solid #d1d5db",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "11px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

export default AddShippingPackageToManifest;