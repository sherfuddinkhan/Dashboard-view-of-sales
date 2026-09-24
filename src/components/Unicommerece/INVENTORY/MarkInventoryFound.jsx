import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const INITIAL_FORM = {
  facility: "MAIN",
  itemSku: "",
  shelfCode: "",
  quantityFound: "",
  ageingStartDate: "",
};

const MarkInventoryFound = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);

    if (!form.facility.trim()) {
      setError("Facility is required.");
      return;
    }

    if (!form.itemSku.trim()) {
      setError("Item SKU is required.");
      return;
    }

    if (!form.shelfCode.trim()) {
      setError("Shelf Code is required.");
      return;
    }

    if (
      form.quantityFound === "" ||
      form.quantityFound === null ||
      form.quantityFound === undefined
    ) {
      setError("Quantity Found is required.");
      return;
    }

    const quantity = Number(form.quantityFound);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Quantity Found must be a non-negative integer.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        facility: form.facility.trim(),
        itemSku: form.itemSku.trim(),
        shelfCode: form.shelfCode.trim(),
        quantityFound: quantity,
      };

      if (form.ageingStartDate) {
        payload.ageingStartDate = new Date(
          form.ageingStartDate
        ).toISOString();
      }

      const res = await axios.post(
        `${SERVER_URL}/api/uniware/inventory/mark-found`,
        payload
      );

      setResponse(res.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to mark inventory as found."
      );

      setResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(INITIAL_FORM);
    setResponse(null);
    setError("");
  };

  const errors = response?.errors || [];
  const warnings = response?.warnings || [];
  const notFoundItems = response?.itemQuantityNotFoundDTO || [];

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "0 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Mark Inventory Found
        </h2>

        <p style={{ color: "#666" }}>
          Mark a quantity of an SKU as found on a specific shelf in Uniware.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
              marginTop: "25px",
            }}
          >
            {/* Facility */}
            <div>
              <label style={labelStyle}>
                Facility Code *
              </label>

              <input
                type="text"
                name="facility"
                value={form.facility}
                onChange={handleChange}
                placeholder="MAIN"
                style={inputStyle}
              />
            </div>

            {/* Item SKU */}
            <div>
              <label style={labelStyle}>
                Item SKU *
              </label>

              <input
                type="text"
                name="itemSku"
                value={form.itemSku}
                onChange={handleChange}
                placeholder="TN-WBH-001"
                style={inputStyle}
              />
            </div>

            {/* Shelf */}
            <div>
              <label style={labelStyle}>
                Shelf Code *
              </label>

              <input
                type="text"
                name="shelfCode"
                value={form.shelfCode}
                onChange={handleChange}
                placeholder="A-01-01"
                style={inputStyle}
              />
            </div>

            {/* Quantity */}
            <div>
              <label style={labelStyle}>
                Quantity Found *
              </label>

              <input
                type="number"
                name="quantityFound"
                value={form.quantityFound}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="10"
                style={inputStyle}
              />
            </div>

            {/* Ageing Start Date */}
            <div>
              <label style={labelStyle}>
                Ageing Start Date
              </label>

              <input
                type="datetime-local"
                name="ageingStartDate"
                value={form.ageingStartDate}
                onChange={handleChange}
                style={inputStyle}
              />

              <small style={{ color: "#777" }}>
                Optional. Sent to Uniware in UTC ISO format.
              </small>
            </div>
          </div>

          {/* Buttons */}
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
              style={primaryButtonStyle}
            >
              {loading ? "Marking..." : "Mark Inventory Found"}
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

        {/* Error */}
        {error && (
          <div style={errorBoxStyle}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div style={{ marginTop: "30px" }}>
            <h3>Uniware Response</h3>

            <div
              style={{
                padding: "15px",
                borderRadius: "6px",
                background: response.successful
                  ? "#e8f5e9"
                  : "#ffebee",
                marginBottom: "20px",
              }}
            >
              <strong>
                {response.successful
                  ? "✓ Operation Successful"
                  : "✕ Operation Failed"}
              </strong>

              {response.message && (
                <div style={{ marginTop: "6px" }}>
                  {response.message}
                </div>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4>Errors</h4>

                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Field</th>
                        <th>Description</th>
                        <th>Message</th>
                      </tr>
                    </thead>

                    <tbody>
                      {errors.map((item, index) => (
                        <tr key={index}>
                          <td>{item.code ?? "N/A"}</td>
                          <td>{item.fieldName || "N/A"}</td>
                          <td>{item.description || "N/A"}</td>
                          <td>{item.message || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4>Warnings</h4>

                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Message</th>
                        <th>Description</th>
                      </tr>
                    </thead>

                    <tbody>
                      {warnings.map((item, index) => (
                        <tr key={index}>
                          <td>{item.code ?? "N/A"}</td>
                          <td>{item.message || "N/A"}</td>
                          <td>{item.description || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Not Found Quantity */}
            {notFoundItems.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <h4>Quantity Not Found</h4>

                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>Item SKU</th>
                        <th>Shelf Code</th>
                        <th>Not Found Quantity</th>
                        <th>Type</th>
                      </tr>
                    </thead>

                    <tbody>
                      {notFoundItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.itemSku || "N/A"}</td>
                          <td>{item.shelfCode || "N/A"}</td>
                          <td>{item.notFoundQuantity ?? 0}</td>
                          <td>{item.type || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw response */}
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                View Raw Response
              </summary>

              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  marginTop: "10px",
                  overflowX: "auto",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const primaryButtonStyle = {
  padding: "11px 20px",
  background: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  padding: "11px 20px",
  background: "#eee",
  color: "#333",
  border: "1px solid #ccc",
  borderRadius: "5px",
  cursor: "pointer",
};

const errorBoxStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#ffebee",
  color: "#b71c1c",
  borderRadius: "6px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default MarkInventoryFound;