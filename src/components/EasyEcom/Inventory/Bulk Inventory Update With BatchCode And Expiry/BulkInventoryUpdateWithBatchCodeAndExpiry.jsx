import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const BulkInventoryUpdateWithBatchCodeAndExpiry = () => {
  const [skus, setSkus] = useState([
    {
      sku: "cello01",
      quantity: 300,
      batchCode: "testbatch1",
      expiryDate: "2022-10-12",
    },
    {
      sku: "ree01",
      quantity: 500,
      batchCode: "testbatch2",
      expiryDate: "2022-11-21",
    },
    {
      sku: "gala01",
      quantity: 4000,
      batchCode: "testbatch3",
      expiryDate: "2022-10-14",
    },
    {
      sku: "kit01",
      quantity: 4500,
      batchCode: "testbatch4",
      expiryDate: "2022-11-05",
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
        batchCode: "",
        expiryDate: "",
      },
    ]);
  };

  /* =========================================================
     Remove SKU
     ========================================================= */

  const removeSku = (index) => {
    setSkus(
      skus.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  /* =========================================================
     Update Field
     ========================================================= */

  const updateField = (index, field, value) => {
    const updated = [...skus];

    updated[index][field] = value;

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

    // Validate rows
    for (const item of skus) {
      if (!item.sku.trim()) {
        setError(
          "SKU is required for every row"
        );
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

      if (!item.batchCode.trim()) {
        setError(
          `Batch Code is required for SKU ${item.sku}`
        );
        return;
      }

      if (!item.expiryDate) {
        setError(
          `Expiry Date is required for SKU ${item.sku}`
        );
        return;
      }

      // Date format validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(item.expiryDate)) {
        setError(
          `Expiry Date must be YYYY-MM-DD for SKU ${item.sku}`
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
          batchCode: item.batchCode.trim(),
          expiryDate: item.expiryDate,
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/inventory/bulkInventoryUpdateWithBatchCodeAndExpiry`,
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
        batchCode: "",
        expiryDate: "",
      },
    ]);

    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>
        Bulk Inventory Update With BatchCode And Expiry
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 150px 1fr 180px 100px",
            gap: "10px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          <div>SKU</div>
          <div>Quantity</div>
          <div>Batch Code</div>
          <div>Expiry Date</div>
          <div>Action</div>
        </div>

        {/* Rows */}
        {skus.map((item, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 150px 1fr 180px 100px",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            {/* SKU */}
            <input
              type="text"
              value={item.sku}
              onChange={(e) =>
                updateField(
                  index,
                  "sku",
                  e.target.value
                )
              }
              placeholder="SKU"
              disabled={loading}
              style={{
                padding: "10px",
              }}
            />

            {/* Quantity */}
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateField(
                  index,
                  "quantity",
                  e.target.value
                )
              }
              placeholder="Quantity"
              disabled={loading}
              style={{
                padding: "10px",
              }}
            />

            {/* Batch Code */}
            <input
              type="text"
              value={item.batchCode}
              onChange={(e) =>
                updateField(
                  index,
                  "batchCode",
                  e.target.value
                )
              }
              placeholder="Batch Code"
              disabled={loading}
              style={{
                padding: "10px",
              }}
            />

            {/* Expiry Date */}
            <input
              type="date"
              value={item.expiryDate}
              onChange={(e) =>
                updateField(
                  index,
                  "expiryDate",
                  e.target.value
                )
              }
              disabled={loading}
              style={{
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

        {/* Add */}
        <button
          type="button"
          onClick={addSku}
          disabled={loading}
          style={{
            marginTop: "10px",
          }}
        >
          + Add SKU
        </button>

        <br />
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

      {/* Response */}
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

export default BulkInventoryUpdateWithBatchCodeAndExpiry;