import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

const API_BASE_URL = "http://127.0.0.1:5000/api";

const ReturnPrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReturnPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/decision-tree`);
      setPredictions(response.data.predictions || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load return predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnPredictions();
  }, []);

  const getRiskStyle = (risk) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
      textTransform: 'capitalize'
    };

    switch (risk?.toLowerCase()) {
      case 'high': 
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#b91c1c' };
      case 'medium': 
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#b45309' };
      case 'low': 
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#047857' };
      default: 
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
  <div style={styles.container}>
    {/* Top Action Bar */}
    <div style={styles.header}>
      <div>
        <h2 style={styles.title}>Return Prediction</h2>
        <p style={styles.subtitle}>Decision Tree Model</p>
      </div>
      <button
        onClick={fetchReturnPredictions}
        disabled={loading}
        style={{
          ...styles.refreshButton,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        <RefreshCw 
          size={16} 
          style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} 
        />
        Refresh
      </button>
    </div>

    {/* Error Alert Box */}
    {error && (
      <div style={styles.errorBox}>
        <AlertCircle size={20} style={{ color: '#b91c1c', flexShrink: 0 }} /> 
        <span>{error}</span>
      </div>
    )}

    {/* Summary Matrix Cards */}
    <div style={styles.metricsGrid}>
      <div style={styles.card}>
        <p style={styles.cardLabel}>Total Shipments</p>
        <p style={{ ...styles.cardValue, color: '#1e293b' }}>
          {summary.total_shipments?.toLocaleString() || '—'}
        </p>
      </div>

      <div style={styles.card}>
        <p style={styles.cardLabel}>Predicted Returns</p>
        <p style={{ ...styles.cardValue, color: '#dc2626' }}>
          {summary.predicted_returns?.toLocaleString() || '—'}
        </p>
      </div>

      <div style={styles.card}>
        <p style={styles.cardLabel}>Actual Returned Orders</p>
        <p style={{ ...styles.cardValue, color: '#d97706' }}>
          {summary.returned_orders?.toLocaleString() || '—'}
        </p>
      </div>

      <div style={styles.card}>
        <p style={styles.cardLabel}>Predicted Return Rate</p>
        <p style={{ ...styles.cardValue, color: '#2563eb' }}>
          {summary.total_shipments && summary.predicted_returns
            ? `${((summary.predicted_returns / summary.total_shipments) * 100).toFixed(1)}%`
            : '—'}
        </p>
      </div>
    </div>

    {/* Data Engine Table */}
    <div style={styles.tableCard}>
      <div style={styles.tableTitle}>High-Risk Return Predictions</div>
      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loadingArea}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Analyzing return risk...</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.th, textAlign: 'left', width: '15%' }}>Sale ID</th>
                <th style={{ ...styles.th, textAlign: 'right', width: '20%' }}>Delivery Days</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '20%' }}>Risk Level</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '25%' }}>Prediction Status</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '20%' }}>Return Status</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length > 0 ? (
                predictions.map((item) => {
                  const isHighRisk = item.Prediction === true || item.Prediction === "true";
                  const isReturned = item.Returned === true || item.Returned === "true";
                  
                  return (
                    <tr key={item.SaleID} style={styles.tdRow}>
                      <td style={{ ...styles.td, textAlign: 'left', fontFamily: 'monospace', fontWeight: '600', color: '#1e293b' }}>
                        #{item.SaleID}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#475569', fontWeight: '500' }}>
                        {item.DeliveryDays} {item.DeliveryDays === 1 ? 'Day' : 'Days'}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={getRiskStyle(isHighRisk ? 'High' : 'Low')}>
                          {isHighRisk ? 'High Risk' : 'Low Risk'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center', color: isHighRisk ? '#dc2626' : '#64748b', fontWeight: '600' }}>
                        {isHighRisk ? '⚠️ Flagged' : '✓ Clear'}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: isReturned ? '#fee2e2' : '#d1fae5',
                          color: isReturned ? '#b91c1c' : '#047857',
                          border: isReturned ? '1px solid #fca5a5' : '1px solid #a7f3d0'
                        }}>
                          {isReturned ? 'Returned' : 'Kept'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontWeight: '500' }}>
                    No shipping records found in payload.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);
};

// Vanilla CSS style standard object mapping
const styles = {
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#4b5563',
    margin: '4px 0 0 0'
  },
  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'background-color 0.2s ease'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  cardLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    fontWeight: '500'
  },
  cardValue: {
    fontSize: '2.25rem',
    fontWeight: '700',
    margin: '12px 0 0 0',
    letterSpacing: '-0.025em'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  tableTitle: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
    fontSize: '1rem',
    color: '#0f172a'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.925rem'
  },
  thRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '14px 16px',
    fontWeight: '600',
    fontSize: '0.75rem',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tdRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle'
  },
  loadingArea: {
    padding: '48px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: '16px',
    color: '#4b5563',
    fontSize: '0.875rem'
  },
  spinner: {
    height: '48px',
    width: '48px',
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderBottomColor: '#2563eb',
    animation: 'spin 1s linear infinite'
  }
};

// Auto-inject dynamic spinner keyframes directly into the head layer
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleSheet);
}

export default ReturnPrediction;