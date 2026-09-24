import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function SetSaleOrderPriority() {
  const [formData, setFormData] = useState({
    facility: "MAIN",
    saleOrderCode: "",
    priority: 0,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const facility = formData.facility.trim();
    const saleOrderCode = formData.saleOrderCode.trim();

    if (!facility) {
      setError("Facility is required.");
      return;
    }

    if (!saleOrderCode) {
      setError("Sale order code is required.");
      return;
    }

    if (
      formData.priority === "" ||
      !Number.isInteger(Number(formData.priority))
    ) {
      setError("Priority must be an integer.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${SERVER_URL}/api/uniware/sale-orders/set-priority`,
        {
          facility,
          saleOrderCode,
          priority: Number(formData.priority),
        }
      );

      setResult(response.data);
    } catch (err) {
      const apiError = err.response?.data;

      setError(
        apiError?.message ||
          err.message ||
          "Failed to set sale order priority."
      );

      setResult(apiError || null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      facility: "MAIN",
      saleOrderCode: "",
      priority: 0,
    });

    setResult(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "24px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>
        Set Sale Order Priority
      </h2>

      <p style={{ color: "#666", marginBottom: "24px" }}>
        Set the fulfillment priority for a Uniware sale order.
        Higher priority values represent higher priority.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Facility */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Facility *
          </label>

          <input
            type="text"
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            placeholder="MAIN"
            style={inputStyle}
          />

          <small style={{ color: "#777" }}>
            Uniware facility code sent in the Facility header.
          </small>
        </div>

        {/* Sale Order Code */}
        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Sale Order Code *
          </label>

          <input
            type="text"
            name="saleOrderCode"
            value={formData.saleOrderCode}
            onChange={handleChange}
            placeholder="SO123456"
            style={inputStyle}
          />
        </div>

        {/* Priority */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "6px",
            }}
          >
            Priority *
          </label>

          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            step="1"
            style={inputStyle}
          />

          <small style={{ color: "#777" }}>
            Default is 0. Higher value means higher fulfillment priority.
          </small>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "18px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: "6px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Updating..." : "Set Priority"}
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
      </form>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Response</h3>

          <div
            style={{
              padding: "14px",
              marginBottom: "15px",
              background: result.successful
                ? "#e8f5e9"
                : "#ffebee",
              color: result.successful
                ? "#2e7d32"
                : "#c62828",
              borderRadius: "6px",
            }}
          >
            <strong>
              {result.successful ? "Success" : "Failed"}
            </strong>

            {result.message && (
              <div style={{ marginTop: "5px" }}>
                {result.message}
              </div>
            )}
          </div>

          {Array.isArray(result.errors) &&
            result.errors.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <h4>Errors</h4>

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

          {Array.isArray(result.warnings) &&
            result.warnings.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
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

                    {item.code !== undefined && (
                      <div>
                        <small>
                          Code: {item.code}
                        </small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          <details>
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

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "6px",
  background: "#1976d2",
  color: "#fff",
  cursor: "pointer",
  fontSize: "15px",
};

export default SetSaleOrderPriority;