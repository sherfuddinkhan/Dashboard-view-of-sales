import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const SalesOrderERPId = () => {
  const [items, setItems] = useState([
    {
      invoice_id: "",
      erp_status_id: "",
      erp_transaction_id: "",
      erp_response: "",
    },
  ]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      {
        invoice_id: "",
        erp_status_id: "",
        erp_transaction_id: "",
        erp_response: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  };

  const updateERPStatus = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (
          !item.invoice_id ||
          !item.erp_status_id ||
          !item.erp_transaction_id ||
          !item.erp_response.trim()
        ) {
          throw new Error(
            `Please complete all fields for item ${i + 1}`
          );
        }
      }

      const payload = {
        items: items.map((item) => ({
          invoice_id: Number(item.invoice_id),
          erp_status_id: Number(item.erp_status_id),
          erp_transaction_id: Number(item.erp_transaction_id),
          erp_response: item.erp_response,
        })),
      };

      const response = await fetch(
        `${SERVER_URL}/api/erp/update_erp_status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to update ERP status"
        );
      }

      setData(result);
    } catch (err) {
      console.error("Update ERP Status Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setItems([
      {
        invoice_id: "",
        erp_status_id: "",
        erp_transaction_id: "",
        erp_response: "",
      },
    ]);

    setData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Sales Order ERP ID</h2>

      <p style={{ color: "#666" }}>
        Update ERP status and ERP transaction ID for sales
        order invoices.
      </p>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "20px",
            marginBottom: "15px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Invoice Item {index + 1}
            </h3>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  padding: "7px 12px",
                  border: "none",
                  borderRadius: "4px",
                  background: "#dc3545",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label>Invoice ID</label>

              <input
                type="number"
                value={item.invoice_id}
                onChange={(e) =>
                  handleChange(
                    index,
                    "invoice_id",
                    e.target.value
                  )
                }
                placeholder="77930869"
                style={inputStyle}
              />
            </div>

            <div>
              <label>ERP Status ID</label>

              <input
                type="number"
                value={item.erp_status_id}
                onChange={(e) =>
                  handleChange(
                    index,
                    "erp_status_id",
                    e.target.value
                  )
                }
                placeholder="3"
                style={inputStyle}
              />
            </div>

            <div>
              <label>ERP Transaction ID</label>

              <input
                type="number"
                value={item.erp_transaction_id}
                onChange={(e) =>
                  handleChange(
                    index,
                    "erp_transaction_id",
                    e.target.value
                  )
                }
                placeholder="123432123"
                style={inputStyle}
              />
            </div>

            <div>
              <label>ERP Response</label>

              <input
                type="text"
                value={item.erp_response}
                onChange={(e) =>
                  handleChange(
                    index,
                    "erp_response",
                    e.target.value
                  )
                }
                placeholder="Successfull"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={addItem}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "1px solid #1976d2",
            borderRadius: "5px",
            background: "#fff",
            color: "#1976d2",
            cursor: "pointer",
          }}
        >
          + Add Invoice
        </button>

        <button
          type="button"
          onClick={updateERPStatus}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "5px",
            background: "#1976d2",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "Update ERP Status"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  marginTop: "6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

export default SalesOrderERPId;