import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const OrderMetrics = () => {
  const [accessToken, setAccessToken] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [granularity, setGranularity] = useState("Day");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-02");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const getMetrics = async () => {
    if (!accessToken) return setError("Amazon Access Token (LWA) required");
    setLoading(true); setError(""); setData("");
    try {
      // Interval format: ISO8601--ISO8601 e.g. 2024-01-01T00:00:00-07:00--2024-01-02T00:00:00-07:00
      const interval = `${startDate}T00:00:00-07:00--${endDate}T00:00:00-07:00`;
      
      const res = await axios.post(`${NODE_API}/amazon/sales/metrics`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        marketplaceIds: marketplaceId,
        granularity,
        interval
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Sales API - v1 - Order Metrics & Sales</h2>
      <p style={styles.sub}>Get sales metrics, order counts, unit counts by interval</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <select value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input}>
              <option value="ATVPDKIKX0DER">US - ATVPDKIKX0DER</option>
              <option value="A21TJRUUN4KGV">India - A21TJRUUN4KGV</option>
              <option value="A1F83G8C2ARO7P">UK - A1F83G8C2ARO7P</option>
              <option value="A1PA6795UKMFR9">Germany - A1PA6795UKMFR9</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Granularity</label>
            <select value={granularity} onChange={e=>setGranularity(e.target.value)} style={styles.input}>
              <option value="Hour">Hour</option>
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Total">Total</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Start Date</label>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={styles.input} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>End Date</label>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={styles.input} />
          </div>
        </div>

        <button onClick={getMetrics} disabled={loading} style={styles.btn}>
          {loading ? "Loading..." : "Get Order Metrics"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Metrics Response</h3>
          <textarea rows={20} readOnly value={data} style={styles.payloadArea} />
          <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor:"red"}}>
          <h3 style={{color:"red"}}>Error</h3>
          <textarea rows={8} readOnly value={error} style={styles.errorArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:8 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:400, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600, marginTop:12 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 }
};

export default OrderMetrics;