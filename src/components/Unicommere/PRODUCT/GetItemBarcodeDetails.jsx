import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  facility: "",
  itemCode: "",
};

const GetItemBarcodeDetails = () => {
  const [form, setForm] = useState(initialForm);

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

    if (!form.facility.trim()) {
      setError("Facility Code is required.");
      return;
    }

    if (!form.itemCode.trim()) {
      setError("Item Code / Barcode is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        facility: form.facility.trim(),
        itemCode: form.itemCode.trim(),
      };

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/items/barcode-details`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      const apiError = err.response?.data;

      setResponse(apiError || null);

      setError(
        apiError?.message ||
          err.message ||
          "Failed to fetch item barcode details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setResponse(null);
    setError("");
  };

  const item = response?.itemDTO;
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
            Get Item Barcode Details
          </h1>

          <p style={subtitleStyle}>
            Fetch item and barcode details from Uniware using
            the item code / barcode.
          </p>

          <div style={endpointStyle}>
            <strong>Uniware Endpoint:</strong>{" "}
            /services/rest/v1/product/item/get
          </div>

          <div style={facilityNoticeStyle}>
            <strong>Facility-level API:</strong>{" "}
            Facility Code is required and will be sent in the
            Uniware request header.
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

              {/* Facility */}
              <div>
                <label style={labelStyle}>
                  Facility Code{" "}
                  <span style={requiredStyle}>*</span>
                </label>

                <input
                  type="text"
                  name="facility"
                  value={form.facility}
                  onChange={handleChange}
                  placeholder="MAIN"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Uniware facility code.
                </small>
              </div>

              {/* Item Code */}
              <div>
                <label style={labelStyle}>
                  Item Code / Barcode{" "}
                  <span style={requiredStyle}>*</span>
                </label>

                <input
                  type="text"
                  name="itemCode"
                  value={form.itemCode}
                  onChange={handleChange}
                  placeholder="000002"
                  style={inputStyle}
                />

                <small style={helpStyle}>
                  Barcode/item code as stored in Uniware.
                </small>
              </div>

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
        {/* RESPONSE */}
        {/* ================================================== */}

        {response && (
          <div style={cardStyle}>

            <h2 style={sectionTitleStyle}>
              Uniware Response
            </h2>

            {/* Status */}
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
                  Barcode / Item Information
                </h2>

                <div style={infoGridStyle}>

                  <Info
                    label="Item Code"
                    value={item.code}
                  />

                  <Info
                    label="Status"
                    value={item.status}
                  />

                  <Info
                    label="Inventory Type"
                    value={item.inventoryType}
                  />

                  <Info
                    label="Item SKU"
                    value={item.itemSKU}
                  />

                  <Info
                    label="Item Type Name"
                    value={item.itemTypeName}
                  />

                  <Info
                    label="Vendor"
                    value={item.vendor}
                  />

                  <Info
                    label="Vendor Code"
                    value={item.vendorcode}
                  />

                  <Info
                    label="Vendor SKU Code"
                    value={item.vendorSkuCode}
                  />

                  <Info
                    label="Created Facility"
                    value={item.createdFacilityCode}
                  />

                  <Info
                    label="Current Facility"
                    value={item.currentFacilityCode}
                  />

                  <Info
                    label="Shelf Code"
                    value={item.shelfCode}
                  />

                  <Info
                    label="Determine Expiry From"
                    value={item.determineExpiryFrom}
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
                    label="Unit Price"
                    value={formatAmount(
                      item.unitPrice
                    )}
                  />

                  <Info
                    label="Maximum Retail Price"
                    value={formatAmount(
                      item.maxRetailPrice
                    )}
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
                    label="Brand"
                    value={item.brand}
                  />

                  <Info
                    label="Rejection Reason"
                    value={item.rejectionReason}
                  />

                  <Info
                    label="Created"
                    value={formatDate(
                      item.created
                    )}
                  />

                  <Info
                    label="Updated"
                    value={formatDate(
                      item.updated
                    )}
                  />

                  <Info
                    label="Expiry Date"
                    value={item.expiryDate}
                  />

                  <Info
                    label="Manufacturing Date"
                    value={
                      item.manufacturingDate
                    }
                  />

                  <Info
                    label="Dispatch Tolerance Breach"
                    value={
                      item.dispatchToleranceBreach
                    }
                  />

                </div>

                {/* ================================================== */}
                {/* PURCHASE / GRN */}
                {/* ================================================== */}

                <div style={subSectionStyle}>

                  <h3 style={subHeadingStyle}>
                    Purchase & GRN
                  </h3>

                  <div style={infoGridStyle}>

                    <Info
                      label="Inflow Receipt Code"
                      value={
                        item.inflowReceiptCode
                      }
                    />

                    <Info
                      label="Purchase Order Code"
                      value={
                        item.purchaseOrderCode
                      }
                    />

                    <Info
                      label="Last Putaway Code"
                      value={
                        item.lastPutawayCode
                      }
                    />

                  </div>

                </div>

                {/* ================================================== */}
                {/* ITEM TYPE */}
                {/* ================================================== */}

                <div style={subSectionStyle}>

                  <h3 style={subHeadingStyle}>
                    Item Type
                  </h3>

                  <div style={infoGridStyle}>

                    <Info
                      label="Item Type Name"
                      value={
                        item.itemTypeName
                      }
                    />

                    <Info
                      label="Item SKU"
                      value={item.itemSKU}
                    />

                  </div>

                  {item.itemTypeImageUrl && (
                    <div style={imageContainerStyle}>
                      <img
                        src={item.itemTypeImageUrl}
                        alt={
                          item.itemTypeName ||
                          "Item"
                        }
                        style={imageStyle}
                      />
                    </div>
                  )}

                  {item.itemTypePageUrl && (
                    <div
                      style={{
                        marginTop: "12px",
                      }}
                    >
                      <a
                        href={item.itemTypePageUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={linkStyle}
                      >
                        Open Item Type Page
                      </a>
                    </div>
                  )}

                </div>

                {/* ================================================== */}
                {/* CUSTOM FIELDS */}
                {/* ================================================== */}

                <CustomFieldTable
                  title="Item Type Custom Fields"
                  fields={
                    item.itemTypeCustomFieldValues
                  }
                />

                <CustomFieldTable
                  title="Sale Order Custom Fields"
                  fields={
                    item.saleOrderCustomFieldValues
                  }
                />

                <CustomFieldTable
                  title="Item Custom Fields"
                  fields={
                    item.itemCustomFields
                  }
                />

                {/* ================================================== */}
                {/* ITEM DETAIL FIELDS */}
                {/* ================================================== */}

                <GenericList
                  title="Item Detail Fields"
                  items={
                    item.itemDetailFields
                  }
                />

                {/* ================================================== */}
                {/* SALE ORDER ITEMS */}
                {/* ================================================== */}

                <GenericList
                  title="Sale Order Item Details"
                  items={
                    item.saleOrderItemDTOs
                  }
                />

                {/* ================================================== */}
                {/* GATEPASS */}
                {/* ================================================== */}

                <GenericList
                  title="Gatepass Details"
                  items={
                    item.gatePassDTOs
                  }
                />

                {/* ================================================== */}
                {/* INFLOW RECEIPT ITEM */}
                {/* ================================================== */}

                <GenericList
                  title="Inflow Receipt Item Details"
                  items={
                    item.inflowReceiptItemDTO
                  }
                />

                {/* ================================================== */}
                {/* PURCHASE ORDER */}
                {/* ================================================== */}

                <GenericList
                  title="Purchase Order Details"
                  items={
                    item.purchaseOrderDTO
                  }
                />

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

                {errors.map((errorItem, index) => (
                  <div
                    key={index}
                    style={errorItemStyle}
                  >
                    <div>
                      <strong>Code:</strong>{" "}
                      {errorItem.code ?? "N/A"}
                    </div>

                    <div>
                      <strong>Field:</strong>{" "}
                      {errorItem.fieldName ||
                        "N/A"}
                    </div>

                    <div>
                      <strong>Message:</strong>{" "}
                      {errorItem.message ||
                        "N/A"}
                    </div>

                    {errorItem.description && (
                      <div>
                        <strong>
                          Description:
                        </strong>{" "}
                        {errorItem.description}
                      </div>
                    )}

                    {errorItem.errorParams && (
                      <pre
                        style={smallPreStyle}
                      >
                        {JSON.stringify(
                          errorItem.errorParams,
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

                {warnings.map(
                  (warning, index) => (
                    <div
                      key={index}
                      style={warningItemStyle}
                    >
                      <div>
                        <strong>Code:</strong>{" "}
                        {warning.code ?? "N/A"}
                      </div>

                      <div>
                        <strong>Message:</strong>{" "}
                        {warning.message ||
                          "N/A"}
                      </div>

                      {warning.description && (
                        <div>
                          <strong>
                            Description:
                          </strong>{" "}
                          {warning.description}
                        </div>
                      )}
                    </div>
                  )
                )}

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
// INFO COMPONENT
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
// CUSTOM FIELD TABLE
// ============================================================

const CustomFieldTable = ({
  title,
  fields,
}) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return null;
  }

  return (
    <div style={subSectionStyle}>

      <h3 style={subHeadingStyle}>
        {title}
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
            {fields.map((field, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// GENERIC LIST
// ============================================================

const GenericList = ({
  title,
  items,
}) => {
  if (!items) {
    return null;
  }

  const normalizedItems = Array.isArray(items)
    ? items
    : [items];

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <div style={subSectionStyle}>

      <h3 style={subHeadingStyle}>
        {title}
      </h3>

      {normalizedItems.map(
        (item, index) => (
          <div
            key={index}
            style={genericItemStyle}
          >
            <pre style={genericPreStyle}>
              {JSON.stringify(
                item,
                null,
                2
              )}
            </pre>
          </div>
        )
      )}

    </div>
  );
};

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

const formatDate = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isNaN(number)) {
    const date = new Date(number);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }

  return String(value);
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

const facilityNoticeStyle = {
  marginTop: "10px",
  padding: "12px 14px",
  background: "#fff7ed",
  color: "#9a3412",
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

const imageContainerStyle = {
  marginTop: "15px",
};

const imageStyle = {
  maxWidth: "180px",
  maxHeight: "180px",
  objectFit: "contain",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "8px",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 600,
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
  verticalAlign: "top",
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

const genericItemStyle = {
  marginBottom: "10px",
};

const genericPreStyle = {
  margin: 0,
  padding: "14px",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: "8px",
  overflowX: "auto",
  fontSize: "12px",
  lineHeight: 1.5,
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

export default GetItemBarcodeDetails;