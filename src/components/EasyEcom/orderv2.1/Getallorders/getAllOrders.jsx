import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetAllOrders = () => {
  const [startDate, setStartDate] = useState("2023-09-12 00:00:00");
  const [endDate, setEndDate] = useState("2023-09-19 00:00:00");
  const [limit, setLimit] = useState(50);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAllOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("JWT token not found. Please login first.");
        return;
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to fetch EasyEcom orders"
        );
      }

      // EasyEcom response can differ depending on the API response structure.
      // Keep the complete response available.
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data?.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data?.data)) {
        setOrders(data.data);
      } else if (Array.isArray(data?.data?.orders)) {
        setOrders(data.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Get All Orders Error:", err);
      setError(err.message || "Something went wrong");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <div style={styles.container}>
      <h2>EasyEcom - Get All Orders</h2>

      <div style={styles.filterContainer}>
        <div style={styles.field}>
          <label>Start Date</label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
          />
        </div>

        <div style={styles.field}>
          <label>End Date</label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
          />
        </div>

        <div style={styles.field}>
          <label>Limit</label>
          <input
            type="number"
            min="1"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>

        <button
          onClick={getAllOrders}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Loading..." : "Get All Orders"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div style={styles.empty}>
          No orders found. Select the date range and click
          <strong> Get All Orders</strong>.
        </div>
      )}

      {orders.length > 0 && (
        <div style={styles.result}>
          <div style={styles.resultHeader}>
            <h3>Orders</h3>
            <span>Total: {orders.length}</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Order Number</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Marketplace</th>
                  <th>Customer</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.id || order.orderId || index}>
                    <td>{index + 1}</td>

                    <td>
                      {formatValue(
                        order.id ||
                          order.orderId ||
                          order.order_id
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.orderNumber ||
                          order.order_number ||
                          order.orderNo
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.orderDate ||
                          order.order_date ||
                          order.createdAt ||
                          order.created_at
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.status ||
                          order.orderStatus ||
                          order.order_status
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.marketplace ||
                          order.marketplaceName ||
                          order.marketplace_name
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.customerName ||
                          order.customer_name ||
                          order.buyerName ||
                          order.buyer_name
                      )}
                    </td>

                    <td>
                      {formatValue(
                        order.total ||
                          order.totalAmount ||
                          order.total_amount ||
                          order.grandTotal
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details style={styles.rawResponse}>
            <summary>View Raw Response</summary>

            <pre>
              {JSON.stringify(orders, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },

  filterContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f8f9fa",
    flexWrap: "wrap",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#1976d2",
    color: "#fff",
    fontWeight: "bold",
  },

  error: {
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "5px",
    background: "#ffebee",
    color: "#c62828",
  },

  empty: {
    padding: "30px",
    textAlign: "center",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  result: {
    marginTop: "20px",
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  rawResponse: {
    marginTop: "20px",
  },
};

export default GetAllOrders;
