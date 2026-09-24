import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const DATE_TYPES = [
  "CREATED",
  "UPDATED",
  "FULFILLMENT_TAT",
];

const RETURN_STATUSES = [
  "ALL_RETURNS",
  "RETURN_AWAITED",
  "RETURN_RECEIVED_BUT_NOT_COMPLETED",
  "RETURN_COMPLETED",
];

function SearchSaleOrders() {
  const [formData, setFormData] = useState({
    displayOrderCode: "",
    status: "",
    channel: "",
    customerEmailOrMobile: "",
    customerName: "",
    cashOnDelivery: "",
    fromDate: "",
    toDate: "",
    dateType: "CREATED",
    facilityCodes: "",
    returnStatuses: [],
    updatedSinceInMinutes: "",
    onHold: "",
    searchKey: "",
    displayLength: 20,
    displayStart: 0,
    columns: "",
    sortingCols: "",
    sortColumnIndex: "",
    sortDirection: "",
    columnNames: "",
    getCount: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleReturnStatusChange = (status) => {
    setFormData((prev) => {
      const exists = prev.returnStatuses.includes(status);

      return {
        ...prev,
        returnStatuses: exists
          ? prev.returnStatuses.filter(
              (item) => item !== status
            )
          : [...prev.returnStatuses, status],
      };
    });
  };

  const buildPayload = () => {
    const payload = {};

    if (formData.displayOrderCode.trim()) {
      payload.displayOrderCode =
        formData.displayOrderCode.trim();
    }

    if (formData.status.trim()) {
      payload.status = formData.status.trim();
    }

    if (formData.channel.trim()) {
      payload.channel = formData.channel.trim();
    }

    if (formData.customerEmailOrMobile.trim()) {
      payload.customerEmailOrMobile =
        formData.customerEmailOrMobile.trim();
    }

    if (formData.customerName.trim()) {
      payload.customerName = formData.customerName.trim();
    }

    if (formData.cashOnDelivery !== "") {
      payload.cashOnDelivery =
        formData.cashOnDelivery === "true";
    }

    if (formData.fromDate) {
      payload.fromDate = new Date(
        formData.fromDate
      ).toISOString();
    }

    if (formData.toDate) {
      payload.toDate = new Date(
        formData.toDate
      ).toISOString();
    }

    if (formData.dateType) {
      payload.dateType = formData.dateType;
    }

    const facilities = formData.facilityCodes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (facilities.length > 0) {
      payload.facilityCodes = facilities;
    }

    if (formData.returnStatuses.length > 0) {
      payload.returnStatuses = formData.returnStatuses;
    }

    if (formData.updatedSinceInMinutes !== "") {
      payload.updatedSinceInMinutes = Number(
        formData.updatedSinceInMinutes
      );
    }

    if (formData.onHold !== "") {
      payload.onHold = formData.onHold === "true";
    }

    const searchOptions = {};

    if (formData.searchKey.trim()) {
      searchOptions.searchKey =
        formData.searchKey.trim();
    }

    if (formData.displayLength !== "") {
      searchOptions.displayLength = Number(
        formData.displayLength
      );
    }

    if (formData.displayStart !== "") {
      searchOptions.displayStart = Number(
        formData.displayStart
      );
    }

    if (formData.columns !== "") {
      searchOptions.columns = Number(
        formData.columns
      );
    }

    if (formData.sortingCols !== "") {
      searchOptions.sortingCols = Number(
        formData.sortingCols
      );
    }

    if (formData.sortColumnIndex !== "") {
      searchOptions.sortColumnIndex = Number(
        formData.sortColumnIndex
      );
    }

    if (formData.sortDirection.trim()) {
      searchOptions.sortDirection =
        formData.sortDirection.trim();
    }

    if (formData.columnNames.trim()) {
      searchOptions.columnNames =
        formData.columnNames.trim();
    }

    if (typeof formData.getCount === "boolean") {
      searchOptions.getCount = formData.getCount;
    }

    if (Object.keys(searchOptions).length > 0) {
      payload.searchOptions = searchOptions;
    }

    return payload;
  };

  const validateForm = () => {
    if (
      formData.dateType &&
      !DATE_TYPES.includes(formData.dateType)
    ) {
      return "Invalid date type.";
    }

    if (
      formData.fromDate &&
      formData.toDate &&
      new Date(formData.fromDate) >
        new Date(formData.toDate)
    ) {
      return "From date cannot be after To date.";
    }

    if (
      formData.updatedSinceInMinutes !== "" &&
      (!Number.isInteger(
        Number(formData.updatedSinceInMinutes)
      ) ||
        Number(formData.updatedSinceInMinutes) < 0)
    ) {
      return "Updated since minutes must be a non-negative integer.";
    }

    if (
      formData.displayLength !== "" &&
      (!Number.isInteger(
        Number(formData.displayLength)
      ) ||
        Number(formData.displayLength) < 0)
    ) {
      return "Display length must be a non-negative integer.";
    }

    if (
      formData.displayStart !== "" &&
      (!Number.isInteger(
        Number(formData.displayStart)
      ) ||
        Number(formData.displayStart) < 0)
    ) {
      return "Display start must be a non-negative integer.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/search`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to search sale orders."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      displayOrderCode: "",
      status: "",
      channel: "",
      customerEmailOrMobile: "",
      customerName: "",
      cashOnDelivery: "",
      fromDate: "",
      toDate: "",
      dateType: "CREATED",
      facilityCodes: "",
      returnStatuses: [],
      updatedSinceInMinutes: "",
      onHold: "",
      searchKey: "",
      displayLength: 20,
      displayStart: 0,
      columns: "",
      sortingCols: "",
      sortColumnIndex: "",
      sortDirection: "",
      columnNames: "",
      getCount: true,
    });

    setResult(null);
    setError("");
  };

  const orders = Array.isArray(result?.elements)
    ? result.elements
    : [];

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "30px auto",
        padding: "24px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Search Sale Orders</h2>

      <p style={{ color: "#666" }}>
        Search Uniware sale orders using order, customer,
        status, date, facility, return and pagination filters.
      </p>

      {/* =====================================
          BASIC FILTERS
      ====================================== */}
      <div
        style={{
          marginTop: "25px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Order Filters</h3>

        <div style={gridStyle}>
          <Field
            label="Display Order Code"
            name="displayOrderCode"
            value={formData.displayOrderCode}
            onChange={handleChange}
            placeholder="SO123456"
          />

          <Field
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="CREATED"
          />

          <Field
            label="Channel"
            name="channel"
            value={formData.channel}
            onChange={handleChange}
            placeholder="AMAZON"
          />

          <Field
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Rahul Sharma"
          />

          <Field
            label="Customer Email / Mobile"
            name="customerEmailOrMobile"
            value={formData.customerEmailOrMobile}
            onChange={handleChange}
            placeholder="customer@example.com"
          />

          <div>
            <label style={labelStyle}>
              Cash On Delivery
            </label>

            <select
              name="cashOnDelivery"
              value={formData.cashOnDelivery}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">All</option>
              <option value="true">COD</option>
              <option value="false">Prepaid</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              On Hold
            </label>

            <select
              name="onHold"
              value={formData.onHold}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">All</option>
              <option value="true">On Hold</option>
              <option value="false">Not On Hold</option>
            </select>
          </div>

          <Field
            label="Facility Codes"
            name="facilityCodes"
            value={formData.facilityCodes}
            onChange={handleChange}
            placeholder="01,02,03"
          />
        </div>
      </div>

      {/* =====================================
          DATE FILTERS
      ====================================== */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Date Filters</h3>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>
              Date Type
            </label>

            <select
              name="dateType"
              value={formData.dateType}
              onChange={handleChange}
              style={inputStyle}
            >
              {DATE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              From Date
            </label>

            <input
              type="datetime-local"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              To Date
            </label>

            <input
              type="datetime-local"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <Field
            label="Updated Since (Minutes)"
            name="updatedSinceInMinutes"
            type="number"
            value={formData.updatedSinceInMinutes}
            onChange={handleChange}
            placeholder="60"
          />
        </div>

        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#fff8e1",
            borderRadius: "5px",
            color: "#795548",
          }}
        >
          <strong>Note:</strong> Uniware documents that
          <code> UPDATED </code>
          and
          <code> updatedSinceInMinutes </code>
          should not be used simultaneously.
        </div>
      </div>

      {/* =====================================
          RETURN STATUS
      ====================================== */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Return Status</h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          {RETURN_STATUSES.map((status) => (
            <label
              key={status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <input
                type="checkbox"
                checked={formData.returnStatuses.includes(
                  status
                )}
                onChange={() =>
                  handleReturnStatusChange(status)
                }
              />

              {status}
            </label>
          ))}
        </div>
      </div>

      {/* =====================================
          SEARCH OPTIONS
      ====================================== */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Search Options</h3>

        <div style={gridStyle}>
          <Field
            label="Search Key"
            name="searchKey"
            value={formData.searchKey}
            onChange={handleChange}
            placeholder="Search keyword"
          />

          <Field
            label="Display Length"
            name="displayLength"
            type="number"
            value={formData.displayLength}
            onChange={handleChange}
          />

          <Field
            label="Display Start"
            name="displayStart"
            type="number"
            value={formData.displayStart}
            onChange={handleChange}
          />

          <Field
            label="Columns"
            name="columns"
            type="number"
            value={formData.columns}
            onChange={handleChange}
          />

          <Field
            label="Sorting Columns"
            name="sortingCols"
            type="number"
            value={formData.sortingCols}
            onChange={handleChange}
          />

          <Field
            label="Sort Column Index"
            name="sortColumnIndex"
            type="number"
            value={formData.sortColumnIndex}
            onChange={handleChange}
          />

          <Field
            label="Sort Direction"
            name="sortDirection"
            value={formData.sortDirection}
            onChange={handleChange}
            placeholder="asc / desc"
          />

          <Field
            label="Column Names"
            name="columnNames"
            value={formData.columnNames}
            onChange={handleChange}
            placeholder="code,displayOrderCode,status"
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "15px",
          }}
        >
          <input
            type="checkbox"
            name="getCount"
            checked={formData.getCount}
            onChange={handleCheckboxChange}
          />

          Get Total Count
        </label>
      </div>

      {/* =====================================
          ACTIONS
      ====================================== */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: "#1976d2",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Searching..." : "Search Sale Orders"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: "#757575",
          }}
        >
          Reset
        </button>
      </div>

      {/* =====================================
          ERROR
      ====================================== */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================
          RESULTS
      ====================================== */}
      {result && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3>Sale Orders</h3>

            <div
              style={{
                padding: "8px 14px",
                background: "#e3f2fd",
                borderRadius: "5px",
              }}
            >
              Total Records:{" "}
              <strong>
                {result.totalRecords ?? orders.length}
              </strong>
            </div>
          </div>

          {result.successful === false && (
            <div
              style={{
                padding: "12px",
                marginBottom: "15px",
                background: "#ffebee",
                color: "#c62828",
                borderRadius: "6px",
              }}
            >
              {result.message || "Search failed."}
            </div>
          )}

          {orders.length === 0 ? (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                background: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              No sale orders found.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1000px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>
                      Display Order Code
                    </th>
                    <th style={thStyle}>Channel</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Order Date</th>
                    <th style={thStyle}>Created</th>
                    <th style={thStyle}>Updated</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Mobile</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={
                        order.code ||
                        order.displayOrderCode ||
                        index
                      }
                    >
                      <td style={tdStyle}>
                        {index + 1}
                      </td>

                      <td style={tdStyle}>
                        {order.code || "-"}
                      </td>

                      <td style={tdStyle}>
                        {order.displayOrderCode || "-"}
                      </td>

                      <td style={tdStyle}>
                        {order.channel || "-"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            background: "#f5f5f5",
                          }}
                        >
                          {order.status || "-"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {formatDate(
                          order.displayOrderDateTime
                        )}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(order.created)}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(order.updated)}
                      </td>

                      <td style={tdStyle}>
                        {order.notificationEmail || "-"}
                      </td>

                      <td style={tdStyle}>
                        {order.notificationMobile || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================
              API ERRORS
          ================================== */}
          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4>API Errors</h4>

                {result.errors.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#ffebee",
                      borderRadius: "5px",
                    }}
                  >
                    <strong>
                      {item.fieldName || "Error"}
                    </strong>

                    <div>
                      {item.message ||
                        item.description ||
                        "Unknown error"}
                    </div>

                    {item.code !== undefined && (
                      <small>
                        Code: {item.code}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* =================================
              API WARNINGS
          ================================== */}
          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4>Warnings</h4>

                {result.warnings.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "10px",
                      marginBottom: "8px",
                      background: "#fff8e1",
                      borderRadius: "5px",
                    }}
                  >
                    {item.message ||
                      item.description ||
                      "Warning"}
                  </div>
                ))}
              </div>
            )}

          {/* =================================
              RAW RESPONSE
          ================================== */}
          <details style={{ marginTop: "20px" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Raw Response
            </summary>

            <pre
              style={{
                marginTop: "10px",
                padding: "15px",
                background: "#f5f5f5",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
};

const thStyle = {
  padding: "11px",
  borderBottom: "1px solid #ddd",
  background: "#f5f5f5",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

export default SearchSaleOrders;