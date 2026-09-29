import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const UpdateTrackingStatus = () => {
  const [form, setForm] = useState({
    current_shipment_status_id: 18,
    awb: "89078766787",
    estimated_delivery_date: "2022-04-29",
    delivery_date: "2022-04-29 11:30:30",
    history_scans: [
      {
        status: "In Transit",
        time: "2023-01-01 00:30:30",
        location: "DEL/PC1, Delhi NCR, DELHI",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "current_shipment_status_id"
          ? Number(value)
          : value,
    }));
  };

  const handleScanChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      history_scans: [
        {
          ...prev.history_scans[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/update-tracking-status`,
        form
      );

      setResponse(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update tracking status"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
      }}
    >
      <h2>EasyEcom Update Tracking Status</h2>

      <form onSubmit={handleSubmit}>

        {/* Shipment Status */}
        <div style={{ marginBottom: "15px" }}>
          <label>Current Shipment Status ID</label>

          <input
            type="number"
            name="current_shipment_status_id"
            value={form.current_shipment_status_id}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* AWB */}
        <div style={{ marginBottom: "15px" }}>
          <label>AWB</label>

          <input
            type="text"
            name="awb"
            value={form.awb}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Estimated Delivery */}
        <div style={{ marginBottom: "15px" }}>
          <label>Estimated Delivery Date</label>

          <input
            type="date"
            name="estimated_delivery_date"
            value={form.estimated_delivery_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Delivery Date */}
        <div style={{ marginBottom: "15px" }}>
          <label>Delivery Date</label>

          <input
            type="text"
            name="delivery_date"
            value={form.delivery_date}
            onChange={handleChange}
            placeholder="YYYY-MM-DD HH:mm:ss"
            style={inputStyle}
          />
        </div>

        <h3>History Scan</h3>

        {/* Scan Status */}
        <div style={{ marginBottom: "15px" }}>
          <label>Status</label>

          <input
            type="text"
            value={form.history_scans[0].status}
            onChange={(e) =>
              handleScanChange("status", e.target.value)
            }
            style={inputStyle}
          />
        </div>

        {/* Scan Time */}
        <div style={{ marginBottom: "15px" }}>
          <label>Time</label>

          <input
            type="text"
            value={form.history_scans[0].time}
            onChange={(e) =>
              handleScanChange("time", e.target.value)
            }
            placeholder="YYYY-MM-DD HH:mm:ss"
            style={inputStyle}
          />
        </div>

        {/* Scan Location */}
        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>

          <input
            type="text"
            value={form.history_scans[0].location}
            onChange={(e) =>
              handleScanChange("location", e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "Update Tracking Status"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#ffe5e5",
            color: "#b00020",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#e8f5e9",
          }}
        >
          <h3>Response</h3>

          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box",
};

export default UpdateTrackingStatus;