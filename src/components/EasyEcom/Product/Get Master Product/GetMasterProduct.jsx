import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetMasterProduct = () => {
  const [customFields, setCustomFields] = useState("1");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getMasterProducts = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const params = new URLSearchParams({
        custom_fields: customFields,
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/products/master?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to get master products"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Get Master Product</h2>

      <div style={{ marginBottom: "15px" }}>
        <label>Custom Fields</label>
        <br />

        <input
          type="number"
          value={customFields}
          onChange={(e) => setCustomFields(e.target.value)}
          placeholder="1"
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      <button
        onClick={getMasterProducts}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Master Products"}
      </button>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
          }}
        >
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default GetMasterProduct;
