import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetTrackingDetails = () => {
  const [referenceCode, setReferenceCode] = useState("US-15");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const result = await axios.get(
        `${SERVER_URL}/api/easyecom/carriers/tracking-details`,
        {
          params: {
            reference_code: referenceCode,
          },
        }
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
      <h2>Get Tracking Details</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Reference Code</label>

          <input
            type="text"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
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
          Get Tracking Details
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

export default GetTrackingDetails;

