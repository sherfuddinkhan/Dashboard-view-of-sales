import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const AssignInventoryOldB2B = () => {
  const [orderNumber, setOrderNumber] = useState(
    "B2B/988721782988400077_67_79"
  );

  const [zones, setZones] = useState("BulkZone22031");
  const [bins, setBins] = useState("A001");
  const [locationKey, setLocationKey] = useState(
    "wo9775672384"
  );

  const [orderItems, setOrderItems] = useState([
    {
      suborder_number: "98872178299024357164247",
      quantity: 5,
      sku: "karamcombotest",
      items: [
        {
          sku: "karamcombochild1",
          batch_code: "fgdhgtrf",
        },
        {
          sku: "karamcombochild2",
          batch_code: "btgbttt",
        },
      ],
    },
    {
      suborder_number: "98872178299024364766487",
      quantity: 2,
      sku: "karamcombochild1",
      items: [
        {
          sku: "karamcombochild1",
          batch_code: "fgdhgtrf",
        },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResponseData(null);

    if (!orderNumber.trim()) {
      setError("Order number is required");
      return;
    }

    if (orderItems.length === 0) {
      setError("At least one order item is required");
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        order_number: orderNumber.trim(),

        zones: zones
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        bins: bins
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        location_key: locationKey.trim(),

        order_items: orderItems,
      };

      const response = await fetch(
        `${SERVER_URL}/api/order/assign`,
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
            "Inventory assignment failed"
        );
      }

      setMessage(
        data.message ||
          "Inventory assigned successfully"
      );

      setResponseData(data);
    } catch (err) {
      console.error(
        "Assign inventory error:",
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

  const handleClear = () => {
    setOrderNumber("");
    setZones("");
    setBins("");
    setLocationKey("");
    setOrderItems([]);
    setMessage("");
    setError("");
    setResponseData(null);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Assign Inventory - Old B2B</h2>

      <form onSubmit={handleSubmit}>

        {/* Order Number */}
        <div style={{ marginBottom: "20px" }}>
          <label>Order Number</label>

          <input
            type="text"
            value={orderNumber}
            onChange={(e) =>
              setOrderNumber(e.target.value)
            }
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Zones */}
        <div style={{ marginBottom: "20px" }}>
          <label>Zones</label>

          <input
            type="text"
            value={zones}
            onChange={(e) =>
              setZones(e.target.value)
            }
            placeholder="BulkZone22031"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Bins */}
        <div style={{ marginBottom: "20px" }}>
          <label>Bins</label>

          <input
            type="text"
            value={bins}
            onChange={(e) =>
              setBins(e.target.value)
            }
            placeholder="A001"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Location Key */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            Location Key (Only for 3PL)
          </label>

          <input
            type="text"
            value={locationKey}
            onChange={(e) =>
              setLocationKey(e.target.value)
            }
            placeholder="wo9775672384"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Order Items</h3>

          {orderItems.map((orderItem, index) => (
            <div
              key={index}
              style={{
                padding: "15px",
                marginBottom: "15px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            >
              <div>
                <strong>
                  Suborder:
                </strong>{" "}
                {orderItem.suborder_number}
              </div>

              <div>
                <strong>
                  Quantity:
                </strong>{" "}
                {orderItem.quantity}
              </div>

              <div>
                <strong>
                  SKU:
                </strong>{" "}
                {orderItem.sku}
              </div>

              <div style={{ marginTop: "10px" }}>
                <strong>
                  Items:
                </strong>

                {orderItem.items.map(
                  (item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        marginLeft: "20px",
                        marginTop: "5px",
                      }}
                    >
                      SKU: {item.sku}
                      <br />
                      Batch Code:{" "}
                      {item.batch_code}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Assigning..."
              : "Assign Inventory"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              padding: "10px 20px",
            }}
          >
            Clear
          </button>
        </div>
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

export default AssignInventoryOldB2B;