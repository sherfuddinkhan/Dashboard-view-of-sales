import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, Calendar, AlertCircle, BarChart3, ShieldCheck } from 'lucide-react';

const API_BASE_URL = "http://127.0.0.1:5000/api";

const SalesForecast = () => {
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
    const response = await axios.get(`${API_BASE_URL}/linear-regression`);
      setForecast(response.data.predictions || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load sales forecast data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const getTrendStyle = (trend) => {
    const baseStyle = {
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block',
      border: '1px solid',
    };

    if (trend === 'Up') {
      return { ...baseStyle, backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' };
    }
    if (trend === 'Down') {
      return { ...baseStyle, backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' };
    }
    return { ...baseStyle, backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
  };

  return (
  <div style={styles.dashboardWrapper}>
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales Forecast</h1>
          <p style={styles.subtitle}>Hybrid Predictive Engine (XGBoost + Linear Regression)</p>
        </div>

        <div style={styles.headerControls}>
          {lastUpdated && (
            <span style={styles.syncBadge}>
              Synced: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchForecast}
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
            Recalculate Forecast
          </button>
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: '600', color: '#7f1d1d' }}>Execution Error</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Summary Metrics Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardLabel}>Next 30 Days Forecast</p>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#e0e7ff', color: '#4f46e5' }}><Calendar size={18} /></div>
          </div>
          <div style={styles.cardValueRow}>
            <span style={styles.cardValue}>
              {summary.next_30_days ? `₹${summary.next_30_days.toLocaleString()}` : '—'}
            </span>
            <span style={styles.cardUnit}>Gross Est.</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardLabel}>Next 90 Days Forecast</p>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#eff6ff', color: '#2563eb' }}><BarChart3 size={18} /></div>
          </div>
          <div style={styles.cardValueRow}>
            <span style={styles.cardValue}>
              {summary.next_90_days ? `₹${summary.next_90_days.toLocaleString()}` : '—'}
            </span>
            <span style={styles.cardUnit}>Long Range</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardLabel}>Growth Forecast</p>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#d1fae5', color: '#059669' }}><TrendingUp size={18} /></div>
          </div>
          <div style={styles.cardValueRow}>
            <span style={{ ...styles.cardValue, color: '#059669' }}>
              {summary.growth_rate ? `${summary.growth_rate}%` : '—'}
            </span>
            <span style={styles.cardUnit}>MoM Velocity</span>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardLabel}>Model Confidence Accuracy</p>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#f3e8ff', color: '#9333ea' }}><ShieldCheck size={18} /></div>
          </div>
          <div style={styles.cardValueRow}>
            <span style={styles.cardValue}>
              {summary.accuracy ? `${summary.accuracy}%` : '—'}
            </span>
            <span style={styles.cardUnit}>R-Squared (test)</span>
          </div>
        </div>
      </div>

      {/* Forecast Table Card */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeaderSection}>
          <h2 style={styles.tableTitle}>Expected 30-Day Outlook</h2>
          <span style={styles.tableStatusBadge}>Regression Metrics Balanced</span>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p style={{ margin: '16px 0 4px 0', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Parsing Time-Series Sequences...</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Fitting multi-layered trend weight metrics</p>
          </div>
        ) : (
          <div style={styles.tableOverflowContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableThRow}>
                  <th style={{ ...styles.th, textAlign: 'left', width: '30%' }}>Target Item</th>
                  <th style={{ ...styles.th, textAlign: 'right', width: '15%' }}>Units Sold</th>
                  <th style={{ ...styles.th, textAlign: 'right', width: '20%' }}>Current Revenue</th>
                  <th style={{ ...styles.th, textAlign: 'right', width: '20%' }}>Predicted Revenue</th>
                  <th style={{ ...styles.th, textAlign: 'center', width: '15%' }}>Projected Trend</th>
                </tr>
              </thead>
              <tbody>
                {forecast.length > 0 ? (
                  forecast.map((item) => {
                    // Quick internal logic to check trend direction dynamically
                    const isUp = item.PredictedRevenue > item.Revenue;
                    return (
                      <tr key={item.ProductKey} style={styles.tableTdRow}>
                        <td style={{ ...styles.td, textAlign: 'left', fontWeight: '600', color: '#1e293b' }}>
                          {item.ProductName}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                          {item.TotalSold?.toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#64748b' }}>
                          {item.Revenue ? `₹${item.Revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>
                          {item.PredictedRevenue ? `₹${item.PredictedRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '—'}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={getTrendStyle(isUp ? 'Up' : 'Stable')}>
                            {isUp ? 'Up' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontWeight: '500' }}>
                      No inventory records loaded to build prediction tracks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  </div>
);
};

// Vanilla JavaScript CSS Stylesheet object
const styles = {
  dashboardWrapper: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '32px 24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#334155',
    boxSizing: 'border-box',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  syncBadge: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: '500',
  },
  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.05)',
    transition: 'background-color 0.2s',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  cardLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  iconWrapper: {
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValueRow: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  cardValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.025em',
  },
  cardUnit: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: '4px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  tableHeaderSection: {
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    flexGrow: 1,
  },
  tableStatusBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '4px 10px',
    borderRadius: '100px',
  },
  tableOverflowContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  tableThRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '14px 24px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  tableTdRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  loadingState: {
    padding: '80px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #2563eb',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

// Injection of dynamic spinner keyframes
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleSheet);
}

export default SalesForecast;