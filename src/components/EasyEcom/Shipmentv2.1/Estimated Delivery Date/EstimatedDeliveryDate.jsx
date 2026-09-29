import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const EstimatedDeliveryDate = () => {
  const [sku, setSku] = useState("SKU1");
  const [dropPincode, setDropPincode] = useState("400072");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        SKU: sku,
        drop_pincode: Number(dropPincode),
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/carrier/predict-estimate-deliverydate`,
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
    <div
      style={{
        padding: "20px",
        maxWidth: "700px",
        margin: "auto",
      }}
    >
      <h2>Estimated Delivery Date</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>SKU</label>

          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
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
          <label>Drop Pincode</label>

          <input
            type="number"
            value={dropPincode}
            onChange={(e) => setDropPincode(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit">
          Get Estimated Delivery Date
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EstimatedDeliveryDate;

