import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetInvoices = () => {
  const [accessToken, setAccessToken] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("A2Q3Y263D00KWC"); // Brazil
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const getInvoices = async () => {
    if (!accessToken) return setError("Amazon Access Token (LWA) required");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/invoices/get`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        marketplaceId
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Invoices API - v2024-06-19</h2>
      <p style={styles.sub}>Retrieve Brazilian FBA Invoices - Only BR Marketplace</p>
      <div style={styles.note}>❗Important: This API only retrieves <b>Brazilian FBA invoices</b>. No other invoice types.</div>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <select value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input}>
              <option value="A2Q3Y263D00KWC">Brazil - A2Q3Y263D00KWC</option>
            </select>
          </div>
        </div>

        <button onClick={getInvoices} disabled={loading} style={styles.btn}>
          {loading ? "Fetching..." : "Get Invoices"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Invoices Response</h3>
          <textarea rows={20} readOnly value={data} style={styles.payloadArea} />
          <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor:"red"}}>
          <h3 style={{color:"red"}}>Error - Only available in BR marketplace</h3>
          <textarea rows={10} readOnly value={error} style={styles.errorArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", marginBottom:12 },
  note: { background:"#fef3c7", border:"1px solid #f59e0b", padding:10, borderRadius:8, fontSize:13, marginBottom:16 },
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

export default GetInvoices;