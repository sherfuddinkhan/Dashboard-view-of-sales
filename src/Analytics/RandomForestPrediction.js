import React, { useEffect, useState } from "react";
import axios from "axios";


const RandomForestPrediction = () => {

    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const fetchPrediction = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(
                "http://localhost:5000/api/random-forest"
            );


            setData(response.data.predictions);

            setSummary(response.data.summary);


        } catch(err){

            console.log(err);
            setError(
                "Failed to load Random Forest prediction"
            );

        }
        finally{

            setLoading(false);

        }

    };


    useEffect(()=>{

        fetchPrediction();

    },[]);



   return (
  <div style={styles.container}>
    {/* Header section */}
    <div style={styles.header}>
      <h2 style={styles.title}>Random Forest Revenue Prediction</h2>
      <p style={styles.subtitle}>Predictive Analytics Dashboard</p>
    </div>

    {/* Status Indicators */}
    {error && <div style={styles.errorBox}>⚠️ {error}</div>}
    {loading && <p style={styles.loadingText}>Running ensemble decision trees...</p>}

    {!loading && !error && (
      <>
        {/* Metric Overview Matrix */}
        <div style={styles.metricsGrid}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Products</p>
            <p style={{ ...styles.cardValue, color: '#0f172a' }}>
              {summary.total_products?.toLocaleString() || '0'}
            </p>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Actual Revenue</p>
            <p style={{ ...styles.cardValue, color: '#16a34a' }}>
              ₹{summary.actual_revenue?.toLocaleString() || '0'}
            </p>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Predicted Revenue</p>
            <p style={{ ...styles.cardValue, color: '#2563eb' }}>
              ₹{summary.predicted_revenue?.toLocaleString() || '0'}
            </p>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Model Variance</p>
            <p style={{ 
              ...styles.cardValue, 
              color: summary.actual_revenue && summary.predicted_revenue ? '#475569' : '#94a3b8' 
            }}>
              {summary.actual_revenue && summary.predicted_revenue
                ? `${(((summary.predicted_revenue - summary.actual_revenue) / summary.actual_revenue) * 100).toFixed(1)}%`
                : '—'}
            </p>
          </div>
        </div>

        {/* Structured Data Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40%' }}>Product Name</th>
                <th style={{ ...styles.th, textAlign: 'right', width: '15%' }}>Units Sold</th>
                <th style={{ ...styles.th, textAlign: 'right', width: '22%' }}>Actual Revenue</th>
                <th style={{ ...styles.th, textAlign: 'right', width: '23%' }}>Predicted Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr 
                    key={index} 
                    style={styles.trHover}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ ...styles.td, fontWeight: '500', color: '#1e293b' }}>
                      {item.ProductName}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {item.TotalSold?.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '500', color: '#166534', fontFamily: 'monospace' }}>
                      ₹{item.Revenue?.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '500', color: '#1e40af', fontFamily: 'monospace' }}>
                      ₹{item.PredictedRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No prediction vectors loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
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
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: '500',
    textAlign: 'center',
    padding: '40px 0'
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
    textAlign: 'left',
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
    color: '#334155'
  },
  trHover: {
    transition: 'background-color 0.2s ease'
  }
};

export default RandomForestPrediction;