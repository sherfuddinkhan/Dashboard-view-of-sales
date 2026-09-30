import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const BulkInventoryUpdate = () => {
  const [skus, setSkus] = useState([
    {
      sku: "cello01",
      quantity: 4000,
    },
    {
      sku: "ree01",
      quantity: 1000,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  /* =========================================================
     Add SKU
     ========================================================= */

  const addSku = () => {
    setSkus([
      ...skus,
      {
        sku: "",
        quantity: "",
      },
    ]);
  };

  /* =========================================================
     Remove SKU
     ========================================================= */

  const removeSku = (index) => {
    setSkus(
      skus.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  /* =========================================================
     Update SKU field
     ========================================================= */

  const updateSku = (index, value) => {
    const updated = [...skus];

    updated[index].sku = value;

    setSkus(updated);
  };

  /* =========================================================
     Update Quantity field
     ========================================================= */

  const updateQuantity = (index, value) => {
    const updated = [...skus];

    updated[index].quantity = value;

    setSkus(updated);
  };

  /* =========================================================
     Submit
     ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResponseData(null);

    if (skus.length === 0) {
      setError("At least one SKU is required");
      return;
    }

    // Validate
    for (const item of skus) {
      if (!item.sku.trim()) {
        setError("SKU is required for every row");
        return;
      }

      if (
        item.quantity === "" ||
        item.quantity === null ||
        item.quantity === undefined
      ) {
        setError(
          `Quantity is required for SKU ${item.sku}`
        );
        return;
      }

      if (!Number.isInteger(Number(item.quantity))) {
        setError(
          `Quantity must be an integer for SKU ${item.sku}`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const requestBody = {
        skus: skus.map((item) => ({
          sku: item.sku.trim(),
          quantity: Number(item.quantity),
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/inventory/bulkInventoryUpdate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Bulk inventory update failed"
        );
      }

      setMessage(
        data.message ||
          "Bulk inventory updated successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(
        "Bulk inventory update error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Clear
     ========================================================= */

  const handleClear = () => {
    setSkus([
      {
        sku: "",
        quantity: "",
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Bulk Inventory Update</h2>

      <form onSubmit={handleSubmit}>

        {/* SKU rows */}
        {skus.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            {/* SKU */}
            <input
              type="text"
              value={item.sku}
              onChange={(e) =>
                updateSku(
                  index,
                  e.target.value
                )
              }
              placeholder="SKU"
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px",
              }}
            />

            {/* Quantity */}
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(
                  index,
                  e.target.value
                )
              }
              placeholder="Quantity"
              disabled={loading}
              style={{
                width: "180px",
                padding: "10px",
              }}
            />

            {/* Remove */}
            <button
              type="button"
              onClick={() =>
                removeSku(index)
              }
              disabled={
                loading || skus.length === 1
              }
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add SKU */}
        <button
          type="button"
          onClick={addSku}
          disabled={loading}
          style={{
            marginBottom: "20px",
          }}
        >
          + Add SKU
        </button>

        <br />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Inventory"}
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          style={{
            marginLeft: "10px",
          }}
        >
          Clear
        </button>
      </form>

      {/* Success */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
          }}
        >
          <strong>{message}</strong>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
          }}
        >
          <strong>{error}</strong>
        </div>
      )}

      {/* API Response */}
      {responseData && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response</h3>

          <pre
            style={{
              padding: "15px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BulkInventoryUpdate;