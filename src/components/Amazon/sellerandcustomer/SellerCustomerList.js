import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerCustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getSellerCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "https://localhost:7203/api/SellerCustomer",
        {
          headers: {
            Accept: "*/*",
          },
        }
      );

      console.log("SellerCustomer Response:", response.data);

      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("SellerCustomer Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Failed to load seller customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSellerCustomers();
  }, []);

  // Group customers by sellerId
  const sellers = customers.reduce((groups, customer) => {
    const sellerId = customer.sellerId;

    if (!groups[sellerId]) {
      groups[sellerId] = [];
    }

    groups[sellerId].push(customer);

    return groups;
  }, {});

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.heading}>
            Seller & Customer Management
          </h2>

          <p style={styles.subHeading}>
            All sellers and their respective customers
          </p>
        </div>

        <button
          onClick={getSellerCustomers}
          disabled={loading}
          style={styles.refreshBtn}
        >
          🔄 {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loading}>
          Loading sellers and customers...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      {/* No Data */}
      {!loading && !error && customers.length === 0 && (
        <div style={styles.noData}>
          No seller customers found.
        </div>
      )}

      {/* Seller Groups */}
      {!loading &&
        !error &&
        Object.entries(sellers).map(
          ([sellerId, sellerCustomers]) => (
            <div
              key={sellerId}
              style={styles.sellerCard}
            >

              {/* Seller Header */}
              <div style={styles.sellerHeader}>

                <div>
                  <div style={styles.sellerTitle}>
                    Seller {sellerId}
                  </div>

                  <div style={styles.sellerSubtitle}>
                    Seller ID: {sellerId}
                  </div>
                </div>

                <div style={styles.customerCount}>
                  {sellerCustomers.length}{" "}
                  {sellerCustomers.length === 1
                    ? "Customer"
                    : "Customers"}
                </div>

              </div>

              {/* Customer Table */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>

                  <thead>
                    <tr>
                      <th style={styles.th}>S.No</th>
                      <th style={styles.th}>Customer ID</th>
                      <th style={styles.th}>Customer Code</th>
                      <th style={styles.th}>Customer Name</th>
                      <th style={styles.th}>Contact Person</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>GSTIN</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>State</th>
                      <th style={styles.th}>Credit Limit</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sellerCustomers.map(
                      (customer, index) => (
                        <tr
                          key={customer.customerId}
                        >

                          <td style={styles.td}>
                            {index + 1}
                          </td>

                          <td style={styles.td}>
                            {customer.customerId}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              color: "#1976d2",
                              fontWeight: "bold",
                            }}
                          >
                            {customer.customerCode}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              textAlign: "left",
                              fontWeight: "600",
                            }}
                          >
                            {customer.customerName}
                          </td>

                          <td style={styles.td}>
                            {customer.contactPerson || "-"}
                          </td>

                          <td style={styles.td}>
                            {customer.email || "-"}
                          </td>

                          <td style={styles.td}>
                            {customer.phone || "-"}
                          </td>

                          <td style={styles.td}>
                            {customer.gstin || "-"}
                          </td>

                          <td style={styles.td}>
                            {customer.city || "-"}
                          </td>

                          <td style={styles.td}>
                            {customer.state || "-"}
                          </td>

                          <td style={styles.td}>
                            ₹{" "}
                            {Number(
                              customer.creditLimit || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.status,
                                backgroundColor:
                                  customer.isActive
                                    ? "#d4edda"
                                    : "#f8d7da",
                                color:
                                  customer.isActive
                                    ? "#155724"
                                    : "#721c24",
                              }}
                            >
                              {customer.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                        </tr>
                      )
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )
        )}
    </div>
  );
};

const styles = {
  container: {
    padding: "25px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f9",
    minHeight: "100vh",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  heading: {
    margin: 0,
    color: "#1976d2",
    fontSize: "30px",
    fontWeight: "bold",
  },

  subHeading: {
    marginTop: "6px",
    color: "#777",
    fontSize: "14px",
  },

  refreshBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  loading: {
    background: "#fff3cd",
    color: "#856404",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "600",
  },

  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
  },

  noData: {
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },

  sellerCard: {
    background: "#fff",
    borderRadius: "8px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  sellerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "#1976d2",
    color: "#fff",
  },

  sellerTitle: {
    fontSize: "21px",
    fontWeight: "bold",
  },

  sellerSubtitle: {
    fontSize: "13px",
    marginTop: "4px",
  },

  customerCount: {
    background: "#fff",
    color: "#1976d2",
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },

  th: {
    background: "#f1f5f9",
    color: "#333",
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "center",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "11px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  status: {
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default SellerCustomerList;