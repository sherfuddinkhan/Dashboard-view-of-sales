import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Users, TrendingUp, DollarSign, Layers, AlertCircle, HelpCircle } from 'lucide-react';

const API_BASE_URL = "http://127.0.0.1:5000/api";

const CustomerSegmentation = () => {
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSegmentation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/kmeans`);
      setSegments(response.data.segments || []);
      setSummary(response.data.summary || {});
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching segmentation:', err);
      setError(err.response?.data?.error || 'Failed to load customer segmentation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentation();
  }, []);

  const getSegmentStyle = (segment) => {
    const baseStyle = {
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block',
      border: '1px solid'
    };

    const themes = {
      'High Value': { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' },
      'Loyal': { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
      'At Risk': { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
      'Churn': { backgroundColor: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' },
      'New': { backgroundColor: '#faf5ff', color: '#6b21a8', borderColor: '#e9d5ff' },
    };

    return { ...baseStyle, ...(themes[segment] || { backgroundColor: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' }) };
  };

  return (
    <div style={styles.dashboardWrapper}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Customer Segmentation Dashboard</h1>
            <p style={styles.subtitle}>AI-driven K-Means clustering based on live customer purchasing behavior.</p>
          </div>

          <div style={styles.headerControls}>
            {lastUpdated && (
              <span style={styles.syncBadge}>
                Synced: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchSegmentation}
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
              Refresh Analytics
            </button>
          </div>
        </div>

        {/* Error Box */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, fontWeight: '600', color: '#7f1d1d' }}>Data Fetch Error</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div style={styles.metricsGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.cardLabel}>Total Active Base</p>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#e0e7ff', color: '#4f46e5' }}><Users size={18} /></div>
            </div>
            <div style={styles.cardValueRow}>
              <span style={styles.cardValue}>{summary.total_customers?.toLocaleString() || 0}</span>
              <span style={styles.cardUnit}>Profiles</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.cardLabel}>High Value Core</p>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#d1fae5', color: '#059669' }}><TrendingUp size={18} /></div>
            </div>
            <div style={styles.cardValueRow}>
              <span style={{ ...styles.cardValue, color: '#059669' }}>{summary.high_value_percentage || 0}%</span>
              <span style={styles.cardUnit}>of base</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.cardLabel}>Avg. Basket Size</p>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#fef3c7', color: '#d97706' }}><DollarSign size={18} /></div>
            </div>
            <div style={styles.cardValueRow}>
              <span style={styles.cardValue}>${summary.avg_order_value ? summary.avg_order_value.toFixed(2) : "0.00"}</span>
              <span style={styles.cardUnit}>/ order</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <p style={styles.cardLabel}>Target Clusters</p>
              <div style={{ ...styles.iconWrapper, backgroundColor: '#f3e8ff', color: '#9333ea' }}><Layers size={18} /></div>
            </div>
            <div style={styles.cardValueRow}>
              <span style={styles.cardValue}>{summary.num_clusters || 0}</span>
              <span style={styles.cardUnit}>Groups</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderSection}>
            <h2 style={styles.tableTitle}>Cluster Insights Breakdowns</h2>
            <span style={styles.tableStatusBadge}>K-Means Run Completed</span>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p style={{ margin: '16px 0 4px 0', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Running Segmentation Calculations...</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Recalibrating behavioral group boundaries</p>
            </div>
          ) : (
            <div style={styles.tableOverflowContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableThRow}>
                    <th style={{ ...styles.th, textAlign: 'left' }}>Segment Class</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Volume</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Share of Total</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Mean RFM Score</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Mean Order Value</th>
                    <th style={{ ...styles.th, textAlign: 'left', paddingLeft: '48px' }}>Behavioral Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.length > 0 ? (
                    segments.map((segment, index) => (
                      <tr key={index} style={styles.tableTdRow}>
                        <td style={styles.td}>
                          <span style={getSegmentStyle(segment.segment)}>
                            {segment.segment}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                          {segment.count?.toLocaleString()}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '500', color: '#475569' }}>
                          {segment.percentage}%
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', color: '#475569' }}>
                          {segment.avg_rfm_score}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace', fontWeight: '600', color: '#0f172a' }}>
                          ${typeof segment.avg_order_value === 'number' ? segment.avg_order_value.toFixed(2) : segment.avg_order_value}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'left', paddingLeft: '48px', color: '#64748b', fontSize: '0.75rem', maxWidth: '350px', wordBreak: 'break-word' }}>
                          {segment.characteristics}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontWeight: '500' }}>
                        No operational segmentation matrices compiled yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Explainer Footer */}
        <div style={styles.methodologyFooter}>
          <div style={styles.footerIconWrapper}>
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 style={styles.footerTitle}>Methodology & Application Matrix</h3>
            <p style={styles.footerText}>
              This engine processes raw customer records through an automated <strong>K-Means Clustering</strong> pipeline. Multi-dimensional customer traits—incorporating transaction frequency, volumetric properties, macro revenues, and baseline average value vectors—are analyzed synchronously. These mathematical groupings highlight dynamic behavioral changes, isolating clear targets for precise retention campaigns, personalized rewards systems, and customized re-engagement workflows.
            </p>
          </div>
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
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.05)',
    transition: 'background-color 0.2s',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
  border: '1px solid #fecdd3', //  Fixed
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
    justifyContent: 'between',
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
    color: '#4f46e5',
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
    border: '4px solid #4f46e5',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  methodologyFooter: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    alignItems: 'start',
  },
  footerIconWrapper: {
    padding: '10px',
    backgroundColor: '#1e293b',
    color: '#818cf8',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footerTitle: {
    margin: 0,
    fontWeight: '700',
    color: '#ffffff',
    fontSize: '1rem',
  },
  footerText: {
    color: '#94a3b8',
    marginTop: '6px',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    marginBottom: 0,
  }
};

// Quick injection of global dynamic spinner keyframe
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleSheet);
}

export default CustomerSegmentation;