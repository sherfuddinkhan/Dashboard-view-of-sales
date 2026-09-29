import React, { useState } from "react";

const UpdateSKUPrice = () => {
  const [priceGroupId, setPriceGroupId] = useState("435");

  const [priceItems, setPriceItems] = useState([
    {
      sku: "cello01",
      minQty: 1,
      MaxQty: 100,
      price: 10000,
    },
    {
      sku: "ree01",
      minQty: 101,
      MaxQty: -1,
      price: 9000,
    },
    {
      sku: "xbox2",
      minQty: 0,
      MaxQty: -1,
      price: 15000,
    },
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateItem = (index, field, value) => {
    setPriceItems((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "sku" ? value : Number(value),
            }
          : item
      )
    );
  };

  const addItem = () => {
    setPriceItems((items) => [
      ...items,
      {
        sku: "",
        minQty: 0,
        MaxQty: -1,
        price: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setPriceItems((items) =>
      items.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(
        "http://localhost:5000/api/easyecom/update-sku-price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceGroupId: Number(priceGroupId),
            priceItems,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Update SKU Pricing failed"
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
    <div style={{ maxWidth: "900px", margin: "30px auto" }}>
      <h2>Update SKU Pricing</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label>Price Group ID</label>
          <input
            type="number"
            value={priceGroupId}
            onChange={(e) => setPriceGroupId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <h3>Price Items</h3>

        {priceItems.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "5px",
            }}
          >
            <div style={{ marginBottom: "10px" }}>
              <label>SKU</label>
              <input
                type="text"
                value={item.sku}
                onChange={(e) =>
                  updateItem(index, "sku", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Min Quantity</label>
              <input
                type="number"
                value={item.minQty}
                onChange={(e) =>
                  updateItem(index, "minQty", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Max Quantity</label>
              <input
                type="number"
                value={item.MaxQty}
                onChange={(e) =>
                  updateItem(index, "MaxQty", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label>Price</label>
              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                }}
              />
            </div>

            {priceItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          style={{ marginRight: "10px" }}
        >
          Add Price Item
        </button>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update SKU Pricing"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
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

export default UpdateSKUPrice;

