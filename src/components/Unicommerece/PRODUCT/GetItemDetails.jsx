import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetItemDetails = () => {
  const [form, setForm] = useState({
    skuCode: "",
    cartonScanIdentifier: "",
    kitSku: false,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    if (!form.skuCode.trim()) {
      setError("SKU Code is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        skuCode: form.skuCode.trim(),
        kitSku: form.kitSku,
      };

      if (form.cartonScanIdentifier.trim()) {
        payload.cartonScanIdentifier =
          form.cartonScanIdentifier.trim();
      }

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/items/details`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to fetch item details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      skuCode: "",
      cartonScanIdentifier: "",
      kitSku: false,
    });

    setResponse(null);
    setError("");
  };

  const item = response?.itemTypeDTO;
  const errors = response?.errors || [];
  const warnings = response?.warnings || [];

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div style={cardStyle}>
          <h1 style={titleStyle}>
            Get Item Details
          </h1>

          <p style={subtitleStyle}>
            Fetch complete item details from Uniware using
            the Uniware SKU code.
          </p>

          <div style={endpointStyle}>
            <strong>Uniware Endpoint:</strong>{" "}
            /services/rest/v1/catalog/itemType/get
          </div>

          <div style={tenantStyle}>
            Tenant-level API — Facility Code is not required.
          </div>
        </div>

        {/* ================================================== */}
        {/* SEARCH FORM */}
        {/* ================================================== */}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            Item Search
          </h2>

          <form onSubmit={handleSubmit}>

            <div style={formGridStyle}>

              {/* SKU */}
              <div>
                <label style={labelStyle}>
                  SKU Code{" "}
                  <span style={requiredStyle}>*</span>
                </label>

                <input
                  type="text"
                  name="skuCode"
                  value={form.skuCode}
                  onChange={handleChange}
                  placeholder="BD_Floral_3"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Uniware SKU code of the item.
                </small>
              </div>

              {/* Carton Scan Identifier */}
              <div>
                <label style={labelStyle}>
                  Carton Scan Identifier
                </label>

                <input
                  type="text"
                  name="cartonScanIdentifier"
                  value={form.cartonScanIdentifier}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Optional carton / roll-up SKU.
                </small>
              </div>

            </div>

            {/* KIT SKU */}
            <div style={checkboxContainerStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="kitSku"
                  checked={form.kitSku}
                  onChange={handleChange}
                />

                <span>
                  <strong>Kit SKU</strong>

                  <small style={checkboxHelpStyle}>
                    Enable this when the requested SKU is a
                    Kit SKU.
                  </small>
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div style={errorStyle}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Buttons */}
            <div style={buttonContainerStyle}>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...primaryButtonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading
                  ? "Fetching..."
                  : "Get Item Details"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={secondaryButtonStyle}
              >
                Clear
              </button>

            </div>
          </form>
        </div>

        {/* ================================================== */}
        {/* RESPONSE SUMMARY */}
        {/* ================================================== */}

        {response && (
          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Uniware Response
            </h2>

            <div
              style={{
                ...statusStyle,
                background: response.successful
                  ? "#ecfdf5"
                  : "#fef2f2",
                color: response.successful
                  ? "#047857"
                  : "#b91c1c",
                borderColor: response.successful
                  ? "#a7f3d0"
                  : "#fecaca",
              }}
            >
              <strong>
                {response.successful
                  ? "Successful"
                  : "Failed"}
              </strong>

              {response.message && (
                <div style={{ marginTop: "5px" }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* ================================================== */}
            {/* ITEM DETAILS */}
            {/* ================================================== */}

            {item && (
              <div style={{ marginTop: "25px" }}>

                <h2 style={sectionTitleStyle}>
                  Item Information
                </h2>

                <div style={infoGridStyle}>

                  <Info
                    label="ID"
                    value={item.id}
                  />

                  <Info
                    label="SKU Code"
                    value={item.skuCode}
                  />

                  <Info
                    label="Name"
                    value={item.name}
                  />

                  <Info
                    label="Category Code"
                    value={item.categoryCode}
                  />

                  <Info
                    label="Type"
                    value={item.type}
                  />

                  <Info
                    label="SKU Type"
                    value={item.skuType}
                  />

                  <Info
                    label="TAT"
                    value={item.tat}
                  />

                  <Info
                    label="Enabled"
                    value={formatBoolean(item.enabled)}
                  />

                  <Info
                    label="Fragile"
                    value={formatBoolean(item.fragile)}
                  />

                  <Info
                    label="Dangerous Good"
                    value={formatBoolean(
                      item.dangerousGood
                    )}
                  />

                  <Info
                    label="Requires Customization"
                    value={formatBoolean(
                      item.requiresCustomization
                    )}
                  />

                  <Info
                    label="Expirable"
                    value={formatBoolean(
                      item.expirable
                    )}
                  />

                  <Info
                    label="Shelf Life"
                    value={item.shelfLife}
                  />

                  <Info
                    label="Min Order Size"
                    value={item.minOrderSize}
                  />

                  <Info
                    label="Scan Identifier"
                    value={item.scanIdentifier}
                  />

                  <Info
                    label="Scan Type"
                    value={item.scanType}
                  />

                  <Info
                    label="Brand"
                    value={item.brand}
                  />

                  <Info
                    label="Color"
                    value={item.color}
                  />

                  <Info
                    label="Size"
                    value={item.size}
                  />

                  <Info
                    label="EAN"
                    value={item.ean}
                  />

                  <Info
                    label="UPC"
                    value={item.upc}
                  />

                  <Info
                    label="ISBN"
                    value={item.isbn}
                  />

                  <Info
                    label="HSN Code"
                    value={item.hsnCode}
                  />

                  <Info
                    label="Tax Type Code"
                    value={item.taxTypeCode}
                  />

                  <Info
                    label="GST Tax Type Code"
                    value={item.gstTaxTypeCode}
                  />

                  <Info
                    label="Batch Group Code"
                    value={item.batchGroupCode}
                  />

                  <Info
                    label="Determine Expiry From"
                    value={item.determineExpiryFrom}
                  />

                  <Info
                    label="Tax Calculation Type"
                    value={item.taxCalculationType}
                  />

                  <Info
                    label="GRN Expiry Tolerance"
                    value={item.grnExpiryTolerance}
                  />

                  <Info
                    label="Dispatch Expiry Tolerance"
                    value={
                      item.dispatchExpiryTolerance
                    }
                  />

                  <Info
                    label="Return Expiry Tolerance"
                    value={
                      item.returnExpiryTolerance
                    }
                  />

                  <Info
                    label="Expiry Date"
                    value={item.expiryDate}
                  />

                </div>

                {/* ================================================== */}
                {/* DESCRIPTION */}
                {/* ================================================== */}

                <div style={subSectionStyle}>
                  <h3 style={subHeadingStyle}>
                    Description
                  </h3>

                  <div style={textBoxStyle}>
                    {item.description || "N/A"}
                  </div>
                </div>

                {/* ================================================== */}
                {/* FEATURES */}
                {/* ================================================== */}

                {item.features && (
                  <div style={subSectionStyle}>
                    <h3 style={subHeadingStyle}>
                      Features
                    </h3>

                    <div style={textBoxStyle}>
                      {item.features}
                    </div>
                  </div>
                )}

                {/* ================================================== */}
                {/* DIMENSIONS / WEIGHT */}
                {/* ================================================== */}

                <div style={subSectionStyle}>

                  <h3 style={subHeadingStyle}>
                    Dimensions & Weight
                  </h3>

                  <div style={infoGridStyle}>

                    <Info
                      label="Length (mm)"
                      value={item.length}
                    />

                    <Info
                      label="Width (mm)"
                      value={item.width}
                    />

                    <Info
                      label="Height (mm)"
                      value={item.height}
                    />

                    <Info
                      label="Weight (gm)"
                      value={item.weight}
                    />

                  </div>
                </div>

                {/* ================================================== */}
                {/* PRICING */}
                {/* ================================================== */}

                <div style={subSectionStyle}>

                  <h3 style={subHeadingStyle}>
                    Pricing
                  </h3>

                  <div style={infoGridStyle}>

                    <Info
                      label="Maximum Retail Price"
                      value={formatAmount(
                        item.maxRetailPrice
                      )}
                    />

                    <Info
                      label="Base Price"
                      value={formatAmount(
                        item.basePrice
                      )}
                    />

                    <Info
                      label="Cost Price"
                      value={formatAmount(
                        item.costPrice
                      )}
                    />

                  </div>
                </div>

                {/* ================================================== */}
                {/* TAGS */}
                {/* ================================================== */}

                {Array.isArray(item.tags) &&
                  item.tags.length > 0 && (
                    <div style={subSectionStyle}>

                      <h3 style={subHeadingStyle}>
                        Tags
                      </h3>

                      <div style={tagContainerStyle}>
                        {item.tags.map(
                          (tag, index) => (
                            <span
                              key={index}
                              style={tagStyle}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>

                    </div>
                  )}

                {/* ================================================== */}
                {/* IMAGE / PRODUCT URL */}
                {/* ================================================== */}

                <div style={subSectionStyle}>

                  <h3 style={subHeadingStyle}>
                    Product Links
                  </h3>

                  <div style={infoGridStyle}>

                    <Info
                      label="Image URL"
                      value={item.imageUrl}
                    />

                    <Info
                      label="Product Page URL"
                      value={item.productPageUrl}
                    />

                  </div>

                </div>

                {/* ================================================== */}
                {/* CUSTOM FIELDS */}
                {/* ================================================== */}

                {Array.isArray(
                  item.customFieldValues
                ) &&
                  item.customFieldValues.length > 0 && (
                    <div style={subSectionStyle}>

                      <h3 style={subHeadingStyle}>
                        Custom Fields
                      </h3>

                      <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                          <thead>
                            <tr>
                              <th style={thStyle}>
                                Field Name
                              </th>

                              <th style={thStyle}>
                                Display Name
                              </th>

                              <th style={thStyle}>
                                Value
                              </th>

                              <th style={thStyle}>
                                Type
                              </th>

                              <th style={thStyle}>
                                Required
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {item.customFieldValues.map(
                              (field, index) => (
                                <tr key={index}>
                                  <td style={tdStyle}>
                                    {field.fieldName ||
                                      "N/A"}
                                  </td>

                                  <td style={tdStyle}>
                                    {field.displayName ||
                                      "N/A"}
                                  </td>

                                  <td style={tdStyle}>
                                    {formatValue(
                                      field.fieldValue
                                    )}
                                  </td>

                                  <td style={tdStyle}>
                                    {field.valueType ||
                                      "N/A"}
                                  </td>

                                  <td style={tdStyle}>
                                    {formatBoolean(
                                      field.required
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

                {/* ================================================== */}
                {/* COMPONENT ITEMS */}
                {/* ================================================== */}

                {Array.isArray(
                  item.componentItemTypes
                ) &&
                  item.componentItemTypes.length > 0 && (
                    <div style={subSectionStyle}>

                      <h3 style={subHeadingStyle}>
                        Component Item Types
                      </h3>

                      <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                          <thead>
                            <tr>
                              <th style={thStyle}>
                                SKU
                              </th>

                              <th style={thStyle}>
                                Name
                              </th>

                              <th style={thStyle}>
                                Quantity
                              </th>

                              <th style={thStyle}>
                                Price
                              </th>

                              <th style={thStyle}>
                                Price Ratio
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {item.componentItemTypes.map(
                              (component, index) => {
                                const componentItem =
                                  component.itemTypeDTO ||
                                  {};

                                return (
                                  <tr key={index}>
                                    <td style={tdStyle}>
                                      {componentItem.skuCode ||
                                        "N/A"}
                                    </td>

                                    <td style={tdStyle}>
                                      {componentItem.name ||
                                        "N/A"}
                                    </td>

                                    <td style={tdStyle}>
                                      {component.quantity ??
                                        "N/A"}
                                    </td>

                                    <td style={tdStyle}>
                                      {formatAmount(
                                        component.price
                                      )}
                                    </td>

                                    <td style={tdStyle}>
                                      {component.priceRatio ??
                                        "N/A"}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

              </div>
            )}

            {/* ================================================== */}
            {/* ERRORS */}
            {/* ================================================== */}

            {errors.length > 0 && (
              <div style={subSectionStyle}>

                <h3
                  style={{
                    ...subHeadingStyle,
                    color: "#b91c1c",
                  }}
                >
                  Errors
                </h3>

                {errors.map((item, index) => (
                  <div
                    key={index}
                    style={errorItemStyle}
                  >
                    <div>
                      <strong>Code:</strong>{" "}
                      {item.code ?? "N/A"}
                    </div>

                    <div>
                      <strong>Field:</strong>{" "}
                      {item.fieldName || "N/A"}
                    </div>

                    <div>
                      <strong>Message:</strong>{" "}
                      {item.message || "N/A"}
                    </div>

                    {item.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {item.description}
                      </div>
                    )}

                    {item.errorParams && (
                      <pre style={smallPreStyle}>
                        {JSON.stringify(
                          item.errorParams,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                ))}

              </div>
            )}

            {/* ================================================== */}
            {/* WARNINGS */}
            {/* ================================================== */}

            {warnings.length > 0 && (
              <div style={subSectionStyle}>

                <h3
                  style={{
                    ...subHeadingStyle,
                    color: "#92400e",
                  }}
                >
                  Warnings
                </h3>

                {warnings.map((item, index) => (
                  <div
                    key={index}
                    style={warningItemStyle}
                  >
                    <div>
                      <strong>Code:</strong>{" "}
                      {item.code ?? "N/A"}
                    </div>

                    <div>
                      <strong>Message:</strong>{" "}
                      {item.message || "N/A"}
                    </div>

                    {item.description && (
                      <div>
                        <strong>Description:</strong>{" "}
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}

            {/* ================================================== */}
            {/* RAW RESPONSE */}
            {/* ================================================== */}

            <details style={{ marginTop: "25px" }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                View Raw Uniware Response
              </summary>

              <pre style={rawResponseStyle}>
                {JSON.stringify(
                  response,
                  null,
                  2
                )}
              </pre>
            </details>

          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// HELPER COMPONENT
// ============================================================

const Info = ({ label, value }) => (
  <div style={infoBoxStyle}>
    <div style={infoLabelStyle}>
      {label}
    </div>

    <div style={infoValueStyle}>
      {formatValue(value)}
    </div>
  </div>
);

// ============================================================
// HELPERS
// ============================================================

const formatValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const formatBoolean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "N/A";
  }

  return value ? "Yes" : "No";
};

const formatAmount = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toFixed(2);
};

// ============================================================
// STYLES
// ============================================================

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px",
  boxSizing: "border-box",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const titleStyle = {
  margin: 0,
  fontSize: "27px",
  color: "#1f2937",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
};

const endpointStyle = {
  marginTop: "16px",
  padding: "12px 14px",
  background: "#eef6ff",
  color: "#1d4ed8",
  borderRadius: "8px",
  fontSize: "13px",
  wordBreak: "break-word",
};

const tenantStyle = {
  marginTop: "10px",
  padding: "10px 14px",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: "8px",
  fontSize: "13px",
};

const sectionTitleStyle = {
  marginTop: 0,
  color: "#374151",
  fontSize: "20px",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: 600,
  color: "#374151",
};

const requiredStyle = {
  color: "#dc2626",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const helpStyle = {
  display: "block",
  marginTop: "5px",
  color: "#6b7280",
  fontSize: "12px",
};

const checkboxContainerStyle = {
  marginTop: "20px",
  padding: "14px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  cursor: "pointer",
};

const checkboxHelpStyle = {
  display: "block",
  marginTop: "4px",
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: 400,
};

const errorStyle = {
  marginTop: "20px",
  padding: "14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  borderRadius: "8px",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "24px",
};

const primaryButtonStyle = {
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "12px 24px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#fff",
  color: "#374151",
  cursor: "pointer",
  fontWeight: 600,
};

const statusStyle = {
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: "12px",
};

const infoBoxStyle = {
  padding: "13px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  background: "#f9fafb",
  minWidth: 0,
};

const infoLabelStyle = {
  color: "#6b7280",
  fontSize: "12px",
  marginBottom: "5px",
};

const infoValueStyle = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: 500,
  wordBreak: "break-word",
};

const subSectionStyle = {
  marginTop: "25px",
};

const subHeadingStyle = {
  color: "#374151",
  fontSize: "17px",
  marginBottom: "12px",
};

const textBoxStyle = {
  padding: "14px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const tagContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const tagStyle = {
  padding: "6px 10px",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: "20px",
  fontSize: "13px",
};

const tableWrapperStyle = {
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "700px",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  color: "#374151",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "13px",
  color: "#4b5563",
};

const errorItemStyle = {
  padding: "13px",
  marginBottom: "10px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  color: "#7f1d1d",
};

const warningItemStyle = {
  padding: "13px",
  marginBottom: "10px",
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  color: "#78350f",
};

const smallPreStyle = {
  marginTop: "10px",
  padding: "10px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "6px",
  overflowX: "auto",
  fontSize: "12px",
};

const rawResponseStyle = {
  marginTop: "12px",
  padding: "16px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "12px",
  lineHeight: 1.5,
};

export default GetItemDetails;