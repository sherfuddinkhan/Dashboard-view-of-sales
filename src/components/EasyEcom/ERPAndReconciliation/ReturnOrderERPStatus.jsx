import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

function ReturnOrderERPStatus() {
  const [form, setForm] = useState({
    credit_note_id: "77930869",
    erp_status_id: "3",
    erp_transaction_id: "123432123",
    erp_response: "Successfull"
  });

  const [items, setItems] = useState([
    {
      credit_note_id: "77930869",
      erp_status_id: "3",
      erp_transaction_id: "123432123",
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
        credit_note_id: "",
        erp_status_id: "",
        erp_transaction_id: "",
        erp_response: ""
      }
    ]);
  };

  const addFormItem = () => {
    setItems((previous) => [
      ...previous,
      {
        credit_note_id: form.credit_note_id,
        erp_status_id: form.erp_status_id,
        erp_transaction_id: form.erp_transaction_id,
        erp_response: form.erp_response
      }
    ]);
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

  const removeItem = (index) => {
    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const submitERPStatus = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const payload = {
        items: items.map((item) => ({
          credit_note_id: Number(item.credit_note_id),
          erp_status_id: Number(item.erp_status_id),
          erp_transaction_id: Number(item.erp_transaction_id),
          erp_response: item.erp_response
        }))
      };

      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/erp/update-credit-note-erp-status`,
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
        credit_note_id: "77930869",
        erp_status_id: "3",
        erp_transaction_id: "123432123",
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
      <h2>Return Order ERP Order Updation</h2>

      <p>
        Update ERP status and ERP transaction information
        for EasyEcom return order credit notes.
      </p>

      {/* Add Item */}
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
            <label>Credit Note ID</label>

            <input
              type="number"
              name="credit_note_id"
              value={form.credit_note_id}
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
                <label>Credit Note ID</label>

                <input
                  type="number"
                  value={item.credit_note_id}
                  onChange={(event) =>
                    updateItem(
                      index,
                      "credit_note_id",
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

      {/* Actions */}
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
          onClick={addItem}
          style={{
            padding: "10px 22px"
          }}
        >
          Add Empty Item
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

export default ReturnOrderERPStatus;