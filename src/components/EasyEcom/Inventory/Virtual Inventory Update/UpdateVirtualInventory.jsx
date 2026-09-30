import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdateVirtualInventory = () => {
  const [skus, setSkus] = useState([
    {
      sku: "appy01",
      virtual_invent_count: 18,
    },
    {
      sku: "appy02",
      virtual_invent_count: 3569,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...skus];

    updated[index][field] =
      field === "virtual_invent_count" ? value : value;

    setSkus(updated);
  };

  const addSku = () => {
    setSkus([
      ...skus,
      {
        sku: "",
        virtual_invent_count: "",
      },
    ]);
  };

  const removeSku = (index) => {
    if (skus.length === 1) return;

    setSkus(skus.filter((_, i) => i !== index));
  };

  const updateVirtualInventory = async () => {
    setError("");
    setResponse(null);

    for (let i = 0; i < skus.length; i++) {
      if (!skus[i].sku.trim()) {
        setError(`SKU is required for row ${i + 1}`);
        return;
      }

      if (
        skus[i].virtual_invent_count === "" ||
        skus[i].virtual_invent_count === null ||
        skus[i].virtual_invent_count === undefined
      ) {
        setError(
          `Virtual inventory count is required for row ${i + 1}`
        );
        return;
      }

      if (
        !Number.isInteger(
          Number(skus[i].virtual_invent_count)
        )
      ) {
        setError(
          `Virtual inventory count must be an integer for row ${i + 1}`
        );
        return;
      }
    }

    const payload = {
      skus: skus.map((item) => ({
        sku: item.sku.trim(),
        virtual_invent_count: Number(item.virtual_invent_count),
      })),
    };

    setLoading(true);

    try {
      const res = await fetch(
        `${SERVER_URL}/api/updateVirtualInventoryAPI`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Failed to update virtual inventory"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setSkus([
      {
        sku: "",
        virtual_invent_count: "",
      },
    ]);

    setResponse(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update Virtual Inventory</h2>

      {skus.map((item, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: "10px",
            marginBottom: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label>SKU</label>
            <input
              type="text"
              value={item.sku}
              onChange={(e) =>
                handleChange(
                  index,
                  "sku",
                  e.target.value
                )
              }
              placeholder="appy01"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label>Virtual Inventory Count</label>
            <input
              type="number"
              value={item.virtual_invent_count}
              onChange={(e) =>
                handleChange(
                  index,
                  "virtual_invent_count",
                  e.target.value
                )
              }
              placeholder="18"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => removeSku(index)}
            disabled={skus.length === 1}
            style={{
              padding: "10px 15px",
            }}
          >
            Remove
          </button>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          type="button"
          onClick={addSku}
          disabled={loading}
          style={{
            padding: "10px 20px",
          }}
        >
          + Add SKU
        </button>

        <button
          type="button"
          onClick={updateVirtualInventory}
          disabled={loading}
          style={{
            padding: "10px 20px",
          }}
        >
          {loading
            ? "Updating..."
            : "Update Virtual Inventory"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 20px",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#ffe6e6",
            color: "#b00020",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UpdateVirtualInventory;