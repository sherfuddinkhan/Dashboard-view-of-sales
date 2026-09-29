import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const TagLoopMyntraOrders = () => {
  const [invoiceId, setInvoiceId] = useState("222269997");

  const [suborders, setSuborders] = useState([
    {
      suborder_id: "300163878",
      tagloops: [
        {
          product_id: "13955979",
          tagloop_value: [
            "MP78564001",
            "MP78564002",
            "MP78564003",
          ],
        },
      ],
    },
    {
      suborder_id: "300163909",
      tagloops: [
        {
          product_id: "13955979",
          tagloop_value: [
            "MP78564004",
            "MP78564005",
          ],
        },
      ],
    },
  ]);

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateTagLoops = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const body = {
        invoice_id: Number(invoiceId),
        suborders: suborders.map((suborder) => ({
          suborder_id: Number(suborder.suborder_id),
          tagloops: suborder.tagloops.map((tagloop) => ({
            product_id: Number(tagloop.product_id),
            tagloop_value: tagloop.tagloop_value,
          })),
        })),
      };

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/update/tag-loops`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update tag loops"
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
      <h2>Tag Loop for Myntra Orders</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Invoice ID</label>
        <br />

        <input
          type="number"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          style={{
            width: "300px",
            padding: "8px",
          }}
        />
      </div>

      {suborders.map((suborder, suborderIndex) => (
        <div
          key={suborderIndex}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>Suborder {suborderIndex + 1}</h3>

          <div style={{ marginBottom: "10px" }}>
            <label>Suborder ID</label>
            <br />

            <input
              type="number"
              value={suborder.suborder_id}
              onChange={(e) => {
                const updated = [...suborders];

                updated[suborderIndex].suborder_id =
                  e.target.value;

                setSuborders(updated);
              }}
              style={{
                width: "300px",
                padding: "8px",
              }}
            />
          </div>

          {suborder.tagloops.map((tagloop, tagloopIndex) => (
            <div
              key={tagloopIndex}
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#f5f5f5",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <label>Product ID</label>
                <br />

                <input
                  type="number"
                  value={tagloop.product_id}
                  onChange={(e) => {
                    const updated = [...suborders];

                    updated[suborderIndex].tagloops[
                      tagloopIndex
                    ].product_id = e.target.value;

                    setSuborders(updated);
                  }}
                  style={{
                    width: "300px",
                    padding: "8px",
                  }}
                />
              </div>

              <label>Tag Loop Values</label>

              {tagloop.tagloop_value.map(
                (value, valueIndex) => (
                  <div
                    key={valueIndex}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "5px",
                    }}
                  >
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const updated = [...suborders];

                        updated[suborderIndex].tagloops[
                          tagloopIndex
                        ].tagloop_value[valueIndex] =
                          e.target.value;

                        setSuborders(updated);
                      }}
                      style={{
                        width: "300px",
                        padding: "8px",
                      }}
                    />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={updateTagLoops}
        disabled={loading}
        style={{
          padding: "10px 20px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Updating..." : "Update Tag Loops"}
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

export default TagLoopMyntraOrders;

