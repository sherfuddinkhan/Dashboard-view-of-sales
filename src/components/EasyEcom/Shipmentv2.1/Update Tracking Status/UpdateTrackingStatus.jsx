import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const UpdateTrackingStatus = () => {
  const [currentShipmentStatusId, setCurrentShipmentStatusId] =
    useState("18");

  const [awb, setAwb] = useState("89078766787");

  const [status, setStatus] = useState("In Transit");
  const [time, setTime] = useState("2022-11-21 00:26:18");
  const [location, setLocation] = useState("WH-01, DEL/PB8, Delhi NCR");

  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    "2022-04-29"
  );

  const [deliveryDate, setDeliveryDate] = useState(
    "2022-04-29 11:30:30"
  );

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        current_shipment_status_id: Number(currentShipmentStatusId),
        awb,
        history_scans: [
          {
            status,
            time,
            location,
          },
        ],
        estimated_delivery_date: estimatedDeliveryDate,
        delivery_date: deliveryDate,
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/carrier/update-tracking-status`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data, null, 2)
          : err.message
      );
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Update Tracking Status</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Current Shipment Status ID</label>
          <input
            type="number"
            value={currentShipmentStatusId}
            onChange={(e) => setCurrentShipmentStatusId(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>AWB</label>
          <input
            type="text"
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <h3>History Scan</h3>

        <div style={{ marginBottom: "15px" }}>
          <label>Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Time</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Estimated Delivery Date</label>
          <input
            type="date"
            value={estimatedDeliveryDate}
            onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Delivery Date</label>
          <input
            type="text"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit">
          Update Tracking Status
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UpdateTrackingStatus;

