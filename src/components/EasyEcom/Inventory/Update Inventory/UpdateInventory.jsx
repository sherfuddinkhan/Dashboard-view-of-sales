import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdateInventory = () => {
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResponseData(null);

    if (!sku.trim()) {
      setError("SKU is required");
      return;
    }

    if (quantity === "") {
      setError("Quantity is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${SERVER_URL}/api/inventory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sku: sku.trim(),
            quantity: Number(quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Inventory update failed"
        );
      }

      setMessage(
        data.message || "Inventory updated successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSku("");
    setQuantity("");
    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div>
      <h2>Update Inventory</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>SKU</label>

          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="cello01"
            disabled={loading}
          />
        </div>

        <div>
          <label>Quantity</label>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="500"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Inventory"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
        >
          Clear
        </button>
      </form>

      {message && (
        <div>
          <strong>{message}</strong>
        </div>
      )}

      {error && (
        <div>
          <strong>{error}</strong>
        </div>
      )}

      {responseData && (
        <pre>
          {JSON.stringify(responseData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default UpdateInventory;