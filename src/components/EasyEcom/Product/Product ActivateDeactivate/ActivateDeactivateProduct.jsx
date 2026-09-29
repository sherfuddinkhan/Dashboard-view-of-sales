import React, { useState } from "react";

const ActivateDeactivateProduct = () => {
  const [status, setStatus] = useState("1");
  const [productId, setProductId] = useState("102656530");

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/easyecom/products/activate-deactivate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: Number(status),
            product_id: Number(productId),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Activate/Deactivate Product failed"
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
    <div style={{ maxWidth: "700px", margin: "30px auto" }}>
      <h2>Activate / Deactivate Product</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >
            <option value="1">Activate (1)</option>
            <option value="0">Deactivate (0)</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Product ID</label>

          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Processing..."
            : "Update Product Status"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ActivateDeactivateProduct;

