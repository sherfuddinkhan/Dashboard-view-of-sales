import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  card: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  cardLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', margin: '0 0 8px 0' },
  cardValue: { fontSize: '24px', fontWeight: '700', margin: 0 },
  unitText: { fontSize: '12px', fontWeight: '400', color: '#94a3b8' },
  tableCard: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8fafc', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' },
  td: { padding: '14px 16px', fontSize: '14px', borderTop: '1px solid #f1f5f9' },
  tableRow: { transition: 'background 0.2s' },
  badgeBase: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }
};

const AnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState('vwProductSales');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const views = [
    { id: 'vwProductSales', label: 'Product Sales', table: 'FactSales + DimProduct', cols: 'TotalUnitsSold, TotalSales', algo: 'RandomForest -> listing_prediction()' },
    { id: 'vwCustomerSales', label: 'Customer Sales', table: 'FactSales + DimCustomer', cols: 'TotalOrders, TotalRevenue, AOV', algo: 'KMeans -> CustomerSegmentation()' },
    { id: 'vwFinance', label: 'Finance', table: 'FactFinance + DimSeller', cols: 'Charges, Fees, Taxes', algo: 'IsolationForest -> detect_anomaly()' },
    { id: 'vwShipping', label: 'Shipping', table: 'FactShipping', cols: 'ShipmentStatus, DeliveryDays', algo: 'DecisionTree -> return_prediction()' },
    { id: 'vwListings', label: 'Listings/ABC', table: 'FactInventory + FactListings', cols: 'Stock, Price', algo: 'ABC Analysis' },
  ];

  const fetchData = async (viewName) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/${viewName}`);
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${viewName} - Is backend running?`);
      if (viewName === 'vwProductSales') {
        setData([
          { ProductKey: 1, ASIN: 'B08N5WRWNW', SKU: 'MOUSE-001', ProductName: 'Wireless Mouse', Category: 'Electronics', Brand: 'Logi', Price: 799, TotalUnitsSold: 1240, TotalSales: 991200, ABC_Category: 'A' },
          { ProductKey: 2, ASIN: 'B07XYZ', SKU: 'KEYB-002', ProductName: 'Mechanical Keyboard', Category: 'Electronics', Brand: 'Keychron', Price: 4500, TotalUnitsSold: 320, TotalSales: 1440000, ABC_Category: 'A' },
          { ProductKey: 3, ASIN: 'B09ABC', SKU: 'CABLE-003', ProductName: 'USB-C Cable', Category: 'Accessories', Brand: 'Anker', Price: 299, TotalUnitsSold: 5400, TotalSales: 1614600, ABC_Category: 'A' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeView);
  }, [activeView]);

  const getRevenue = (item) => Number(item.TotalSales || item.TotalRevenue || item.Revenue || 0);
  const getCategory = (item) => item.ABC_Category || item.ABC || 'N/A';
  const totalRevenue = data.reduce((s, i) => s + getRevenue(i), 0);
  const countCat = (c) => data.filter(i => getCategory(i) === c).length;

  return (
    <div style={styles.container}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
        <div>
          <h1 style={styles.title}>AmazonSellerAnalytics</h1>
          <p style={styles.subtitle}>19 Tables (9 Base + 10 SP-API) | 5 Views | 5 ML Models | DESKTOP-BUGGO7</p>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <span style={{background:'#dcfce7', color:'#166534', padding:'4px 8px', borderRadius:'20px', fontSize:'11px'}}>● 10 SP-API Connected</span>
          <span style={{background:'#ede9fe', color:'#6d28d9', padding:'4px 8px', borderRadius:'20px', fontSize:'11px'}}>● 0 Errors</span>
        </div>
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'16px', overflowX:'auto'}}>
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            style={{
              padding:'8px 16px', borderRadius:'8px', border:'1px solid #e2e8f0',
              background: activeView === v.id ? '#0f172a' : 'white',
              color: activeView === v.id ? 'white' : '#475569',
              fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap'
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'12px 16px', marginBottom:'16px', display:'flex', justifyContent:'space-between'}}>
        <div>
          <span style={{fontSize:'12px', color:'#64748b'}}>VIEW:</span> <b style={{fontSize:'13px'}}>{activeView}</b> 
          <span style={{fontSize:'12px', color:'#94a3b8', marginLeft:'12px'}}>TABLES: {views.find(x=>x.id===activeView)?.table}</span>
          <span style={{fontSize:'12px', color:'#94a3b8', marginLeft:'12px'}}>COLS: {views.find(x=>x.id===activeView)?.cols}</span>
        </div>
        <span style={{fontSize:'12px', background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px'}}>{views.find(x=>x.id===activeView)?.algo}</span>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Revenue Pool</p>
          <p style={{...styles.cardValue, color:'#0f172a'}}>₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Class A (Core)</p>
          <p style={{...styles.cardValue, color:'#6d28d9'}}>{countCat('A')} <span style={styles.unitText}>Items</span></p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Class B (Mid Tier)</p>
          <p style={{...styles.cardValue, color:'#b45309'}}>{countCat('B')} <span style={styles.unitText}>Items</span></p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Class C (Low)</p>
          <p style={{...styles.cardValue, color:'#475569'}}>{countCat('C')} <span style={styles.unitText}>Items</span></p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠ {error} (Showing mock data from your 9 base tables)</div>}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{...styles.th, textAlign:'left'}}>Product Identity (DimProduct)</th>
              <th style={{...styles.th, textAlign:'right'}}>Generated Revenue (FactSales.TotalSales)</th>
              <th style={{...styles.th, textAlign:'center'}}>Pareto Class (ABC)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{...styles.td, textAlign:'center', padding:'40px'}}>Loading from {activeView}...</td></tr>
            ) : data.length > 0 ? data.map((item, idx) => (
              <tr key={idx} style={styles.tableRow}>
                <td style={{...styles.td, textAlign:'left', fontWeight:'500'}}>
                  {item.ProductName || item.CustomerName || item.SKU}
                  <div style={{fontSize:'11px', color:'#94a3b8'}}>{item.ASIN || item.SKU} | {item.Category}</div>
                </td>
                <td style={{...styles.td, textAlign:'right', fontFamily:'monospace', fontWeight:'600'}}>
                  ₹{getRevenue(item).toLocaleString(undefined, {minimumFractionDigits:2})}
                </td>
                <td style={{...styles.td, textAlign:'center'}}>
                  <span style={{
                    ...styles.badgeBase,
                    backgroundColor: getCategory(item)==='A' ? '#ede9fe' : getCategory(item)==='B' ? '#fef3c7' : '#f1f5f9',
                    color: getCategory(item)==='A' ? '#6d28d9' : getCategory(item)==='B' ? '#b45309' : '#475569',
                    border: `1px solid ${getCategory(item)==='A' ? '#ddd6fe' : getCategory(item)==='B' ? '#fde68a' : '#e2e8f0'}`
                  }}>
                    Class {getCategory(item)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" style={{...styles.td, textAlign:'center', padding:'40px', color:'#94a3b8'}}>No inventory data parsed. Check {activeView}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
