import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GenerateManifest = () => {
  const [carrierId, setCarrierId] = useState("1");
  const [marketplaceId, setMarketplaceId] = useState("115");
  const [awbNumbers, setAwbNumbers] = useState("GFHYR4645646");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const payload = {
        carrier_id: carrierId,
        marketplace_id: marketplaceId,
        awb_numbers: awbNumbers
          .split(",")
          .map((awb) => awb.trim())
          .filter(Boolean),
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/manifest/generate`,
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
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Generate Manifest</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Carrier ID</label>
          <input
            type="text"
            value={carrierId}
            onChange={(e) => setCarrierId(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Marketplace ID</label>
          <input
            type="text"
            value={marketplaceId}
            onChange={(e) => setMarketplaceId(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>AWB Numbers</label>
          <input
            type="text"
            value={awbNumbers}
            onChange={(e) => setAwbNumbers(e.target.value)}
            placeholder="AWB1, AWB2, AWB3"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "5px",
            }}
          />
          <small>
            For multiple AWBs, separate them with commas.
          </small>
        </div>

        <button type="submit">
          Generate Manifest
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

export default GenerateManifest;

