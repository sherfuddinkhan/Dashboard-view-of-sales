import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const GetAllReturns = () => {
  const [referenceCode, setReferenceCode] = useState("order-02");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetAllReturns = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");
    setLoading(true);

    try {
      const result = await axios.get(
        `${SERVER_URL}/api/easyecom/orders/all-returns`,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <h2>Get All Returns</h2>

      <form onSubmit={handleGetAllReturns}>
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

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get All Returns"}
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

export default GetAllReturns;

