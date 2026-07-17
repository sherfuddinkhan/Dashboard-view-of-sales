import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

const IsolationForestAnomaly = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnomalyData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/anomaly-detection`);
      setData(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load anomaly detection data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const totalTransactions = data.length;
  const anomalyCount = data.filter((item) => item.Anomaly === -1).length;
  const normalCount = data.filter((item) => item.Anomaly === 1).length;

  return (
    <div style={styles.container}>
      {/* Header section */}
      <div style={styles.header}>
        <h2 style={styles.title}>Finance Anomaly Detection</h2>
        <p style={styles.subtitle}>
          Isolation Forest identifies unusual financial transactions
        </p>
      </div>

      {/* Status Alerts */}
      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      {loading ? (
        <div style={styles.loadingArea}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Running isolation vectors & checking clusters...</p>
        </div>
      ) : (
        !error && (
          <>
            {/* Overview Summary Matrix */}
            <div style={styles.metricsGrid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Total Transactions</p>
                <p style={{ ...styles.cardValue, color: '#0f172a' }}>
                  {totalTransactions.toLocaleString()}
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Normal State</p>
                <p style={{ ...styles.cardValue, color: '#16a34a' }}>
                  {normalCount.toLocaleString()}
                </p>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Flagged Anomalies</p>
                <p style={{ ...styles.cardValue, color: '#dc2626' }}>
                  {anomalyCount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Main Data Engine Table */}
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Charges</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Fees</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Taxes</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Settlement</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '20%' }}>Analysis Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => {
                      const isAnomaly = item.Anomaly === -1;
                      return (
                        <tr 
                          key={index}
                          style={styles.tableRow}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontWeight: '500' }}>
                            ₹{item.Charges?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                            ₹{item.Fees?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                            ₹{item.Taxes?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: '#1e293b' }}>
                            ₹{item.Settlement?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={isAnomaly ? styles.badgeAnomaly : styles.badgeNormal}>
                              {isAnomaly ? '⚠️ Anomaly' : '✓ Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No records parsed into workspace.
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
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#0f172a'
  },
  header: {
    marginBottom: '28px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9'
  },
  cardLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 8px 0'
  },
  cardValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '14px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  loadingArea: {
    textAlign: 'center',
    padding: '60px 0'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500',
    margin: 0
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.925rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '14px 16px',
    fontWeight: '600',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    verticalAlign: 'middle'
  },
  tableRow: {
    transition: 'background-color 0.15s ease'
  },
  badgeNormal: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#d1fae5',
    color: '#047857',
    border: '1px solid #a7f3d0'
  },
  badgeAnomaly: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5'
  }
};

export default IsolationForestAnomaly;