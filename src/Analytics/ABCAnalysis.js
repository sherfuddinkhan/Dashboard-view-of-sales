import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const ABCAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchABCData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/abc-analysis`);
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory ABC vectors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchABCData();
  }, []);

  // Compute live matrix allocations from the data stream
  const countCategory = (cat) => data.filter((item) => item.ABC === cat).length;
  const totalRevenue = data.reduce((sum, item) => sum + (Number(item.Revenue) || 0), 0);

  // Helper function to dynamically theme ABC inventory badges
  const getCategoryBadgeStyle = (category) => {
    switch (category?.toUpperCase()) {
      case "A":
        return { backgroundColor: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" };
      case "B":
        return { backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Action Bar Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Product ABC Analysis</h2>
        <p style={styles.subtitle}>
          Inventory Optimization Matrix based on Revenue Performance
        </p>
      </div>

      {/* Error handling alert */}
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {loading ? (
        <div style={styles.loadingArea}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Computing Pareto distribution models...</p>
        </div>
      ) : (
        !error && (
          <>
            {/* Dynamic Inventory Matrix Overview */}
            <div style={styles.metricsGrid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Total Revenue Pool</p>
                <p style={{ ...styles.cardValue, color: "#0f172a" }}>
                  ₹{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Class A (Core Revenue)</p>
                <p style={{ ...styles.cardValue, color: "#6d28d9" }}>
                  {countCategory("A")} <span style={styles.unitText}>Items</span>
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Class B (Mid Tier)</p>
                <p style={{ ...styles.cardValue, color: "#b45309" }}>
                  {countCategory("B")} <span style={styles.unitText}>Items</span>
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Class C (Low Volatility)</p>
                <p style={{ ...styles.cardValue, color: "#475569" }}>
                  {countCategory("C")} <span style={styles.unitText}>Items</span>
                </p>
              </div>
            </div>

            {/* Main Data Analysis Table */}
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, textAlign: "left", width: "50%" }}>Product Identity</th>
                    <th style={{ ...styles.th, textAlign: "right", width: "25%" }}>Generated Revenue</th>
                    <th style={{ ...styles.th, textAlign: "center", width: "25%" }}>Pareto Class</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr 
                        key={index}
                        style={styles.tableRow}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ ...styles.td, textAlign: "left", fontWeight: "500", color: "#1e293b" }}>
                          {item.ProductName}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right", fontFamily: "monospace", fontWeight: "600", color: "#0f172a" }}>
                          ₹{Number(item.Revenue)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <span style={{ ...styles.badgeBase, ...getCategoryBadgeStyle(item.ABC) }}>
                            Class {item.ABC || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ ...styles.td, textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                        No inventory data parsed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "24px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    color: "#0f172a"
  },
  header: {
    marginBottom: "28px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "16px"
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0"
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9"
  },
  cardLabel: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#64748b",
    margin: "0 0 8px 0"
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0
  },
  unitText: {
    fontSize: "0.875rem",
    fontWeight: "400",
    color: "#64748b"
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#991b1b",
    padding: "14px 16px",
    borderRadius: "8px",
    marginBottom: "24px",
    fontSize: "0.9rem",
    fontWeight: "500"
  },
  loadingArea: {
    textAlign: "center",
    padding: "60px 0"
  },
  loadingText: {
    color: "#64748b",
    fontSize: "0.95rem",
    fontWeight: "500",
    margin: 0
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.925rem"
  },
  th: {
    backgroundColor: "#f8fafc",
    padding: "14px 16px",
    fontWeight: "600",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0"
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    color: '#334155',
    verticalAlign: "middle"
  },
  tableRow: {
    transition: "background-color 0.15s ease"
  },
  badgeBase: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.025em"
  }
};

export default ABCAnalysis;