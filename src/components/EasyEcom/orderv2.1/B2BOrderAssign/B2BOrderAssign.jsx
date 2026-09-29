import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const B2BOrderAssign = () => {
  const [orderNumber, setOrderNumber] = useState(
    "B2B/1668591783659815664"
  );

  const [orderItems, setOrderItems] = useState([
    {
      suborder_number: "166859178365985679317946",
      quantity: 1,
      sku: "testassign002",
      items: [
        {
          sku: "testassign002",
        },
      ],
    },
    {
      suborder_number: "166859178365985581221294",
      quantity: 1,
      sku: "combogalaxy01",
      items: [
        {
          sku: "sKu01",
          batch_code: "",
        },
        {
          sku: "galaxy001",
          batch_code: "",
        },
      ],
    },
  ]);

  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOrderItemChange = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...orderItems];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "quantity"
          ? Number(value)
          : value,
    };

    setOrderItems(updatedItems);
  };

  const handleNestedItemChange = (
    orderItemIndex,
    itemIndex,
    field,
    value
  ) => {
    const updatedItems = [...orderItems];

    const nestedItems = [
      ...updatedItems[orderItemIndex].items,
    ];

    nestedItems[itemIndex] = {
      ...nestedItems[itemIndex],
      [field]: value,
    };

    updatedItems[orderItemIndex] = {
      ...updatedItems[orderItemIndex],
      items: nestedItems,
    };

    setOrderItems(updatedItems);
  };

  const assignOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const requestBody = {
        order_number: orderNumber,
        order_items: orderItems,
      };

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/b2b/orders/assign`,
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
          data?.message ||
            "B2B Order Assign failed"
        );
      }

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>B2B Order Assign</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Order Number</label>
        <br />

        <input
          type="text"
          value={orderNumber}
          onChange={(e) =>
            setOrderNumber(e.target.value)
          }
          style={{
            width: "400px",
            padding: "8px",
          }}
        />
      </div>

      <h3>Order Items</h3>

      {orderItems.map((orderItem, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label>Suborder Number</label>
            <br />

            <input
              type="text"
              value={orderItem.suborder_number}
              onChange={(e) =>
                handleOrderItemChange(
                  index,
                  "suborder_number",
                  e.target.value
                )
              }
              style={{
                width: "400px",
                padding: "8px",
              }}
            />
          </div>

          <br />

          <div>
            <label>Quantity</label>
            <br />

            <input
              type="number"
              value={orderItem.quantity}
              onChange={(e) =>
                handleOrderItemChange(
                  index,
                  "quantity",
                  e.target.value
                )
              }
            />
          </div>

          <br />

          <div>
            <label>SKU</label>
            <br />

            <input
              type="text"
              value={orderItem.sku}
              onChange={(e) =>
                handleOrderItemChange(
                  index,
                  "sku",
                  e.target.value
                )
              }
            />
          </div>

          <h4>Items</h4>

          {orderItem.items.map(
            (item, itemIndex) => (
              <div
                key={itemIndex}
                style={{
                  marginBottom: "10px",
                }}
              >
                <input
                  type="text"
                  value={item.sku}
                  onChange={(e) =>
                    handleNestedItemChange(
                      index,
                      itemIndex,
                      "sku",
                      e.target.value
                    )
                  }
                  placeholder="SKU"
                />

                {" "}

                <input
                  type="text"
                  value={item.batch_code || ""}
                  onChange={(e) =>
                    handleNestedItemChange(
                      index,
                      itemIndex,
                      "batch_code",
                      e.target.value
                    )
                  }
                  placeholder="Batch Code"
                />
              </div>
            )
          )}
        </div>
      ))}

      <button
        onClick={assignOrder}
        disabled={loading}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Assigning..."
          : "Assign B2B Order"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
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
export default B2BOrderAssign;

