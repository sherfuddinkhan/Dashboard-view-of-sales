import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function SalesOrderERPStatus() {
  const [form, setForm] = useState({
    invoice_id: "77930869",
    erp_status_id: "3",
    erp_transaction_id: "123432123",
    erp_response: "Successfull"
  });

  const [items, setItems] = useState([
    {
      invoice_id: "77930869",
      erp_status_id: "3",
      erp_transaction_id: "123432123",
      erp_response: "Successfull"
    },
    {
      invoice_id: "77948927",
      erp_status_id: "1",
      erp_transaction_id: "123432124",
      erp_response: "Successfull"
    }
  ]);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        invoice_id: "",
        erp_status_id: "",
        erp_transaction_id: "",
        erp_response: ""
      }
    ]);
  };

  const removeItem = (index) => {
    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const addFormItem = () => {
    setItems((previous) => [
      ...previous,
      {
        invoice_id: form.invoice_id,
        erp_status_id: form.erp_status_id,
        erp_transaction_id: form.erp_transaction_id,
        erp_response: form.erp_response
      }
    ]);
  };

  const submitERPStatus = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const payload = {
        items: items.map((item) => ({
          invoice_id: Number(item.invoice_id),
          erp_status_id: Number(item.erp_status_id),
          erp_transaction_id: Number(item.erp_transaction_id),
          erp_response: item.erp_response
        }))
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/erp/update-erp-status`,
        payload
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data || {
          message: err.message
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setItems([
      {
        invoice_id: "77930869",
        erp_status_id: "3",
        erp_transaction_id: "123432123",
        erp_response: "Successfull"
      },
      {
        invoice_id: "77948927",
        erp_status_id: "1",
        erp_transaction_id: "123432124",
        erp_response: "Successfull"
      }
    ]);

    setResponse(null);
    setError(null);
  };

  const clearAll = () => {
    setItems([]);
    setResponse(null);
    setError(null);
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1100px",
        margin: "0 auto"
      }}
    >
      <h2>Sales Order ERP ID</h2>

      <p>
        Update ERP status and ERP transaction information for
        EasyEcom sales order invoices.
      </p>

      {/* Add Item Form */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "20px"
        }}
      >
        <h3>Add ERP Status Item</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(250px, 1fr))",
            gap: "16px"
          }}
        >
          <div>
            <label>Invoice ID</label>

            <input
              type="number"
              name="invoice_id"
              value={form.invoice_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label>ERP Status ID</label>

            <input
              type="number"
              name="erp_status_id"
              value={form.erp_status_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label>ERP Transaction ID</label>

            <input
              type="number"
              name="erp_transaction_id"
              value={form.erp_transaction_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label>ERP Response</label>

            <input
              type="text"
              name="erp_response"
              value={form.erp_response}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "5px",
                boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addFormItem}
          style={{
            marginTop: "16px",
            padding: "9px 18px"
          }}
        >
          Add Item
        </button>
      </div>

      {/* Items */}
      <div style={{ marginTop: "25px" }}>
        <h3>ERP Status Items</h3>

        {items.length === 0 && (
          <p>No ERP status items added.</p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "18px",
              borderRadius: "8px",
              marginBottom: "15px"
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(150px, 1fr))",
                gap: "12px"
              }}
            >
              <div>
                <label>Invoice ID</label>

                <input
                  type="number"
                  value={item.invoice_id}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "invoice_id",
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label>ERP Status ID</label>

                <input
                  type="number"
                  value={item.erp_status_id}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "erp_status_id",
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label>ERP Transaction ID</label>

                <input
                  type="number"
                  value={item.erp_transaction_id}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "erp_transaction_id",
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label>ERP Response</label>

                <input
                  type="text"
                  value={item.erp_response}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "erp_response",
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "5px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeItem(index)}
              style={{
                marginTop: "12px",
                padding: "7px 14px"
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px"
        }}
      >
        <button
          type="button"
          onClick={submitERPStatus}
          disabled={loading || items.length === 0}
          style={{
            padding: "10px 22px"
          }}
        >
          {loading
            ? "Updating..."
            : "Update ERP Status"}
        </button>

        <button
          type="button"
          onClick={loadSample}
          style={{
            padding: "10px 22px"
          }}
        >
          Load Sample
        </button>

        <button
          type="button"
          onClick={clearAll}
          style={{
            padding: "10px 22px"
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: "30px" }}>
          <h3>Error</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto"
            }}
          >
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {/* Response */}
      {response && (
        <div style={{ marginTop: "30px" }}>
          <h3>EasyEcom Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
              maxHeight: "600px"
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default SalesOrderERPStatus;