import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const CreateQuery = () => {
  const [accessToken, setAccessToken] = useState("");
  const [query, setQuery] = useState(`query { analytics_salesAndTraffic_2023_11_15 { salesAndTrafficByDate(date: "2024-01-01") { sales { unitsOrdered } } } }`);
  const [queryId, setQueryId] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const createQuery = async () => {
    if (!accessToken) return setError("Amazon Access Token (LWA) required");
    if (!query) return setError("GraphQL Query required");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/data-kiosk/create-query`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        query
      });
      setData(JSON.stringify(res.data, null, 2));
      setQueryId(res.data.queryId || "");
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  const getQueryStatus = async () => {
    if (!queryId) return setError("Create query first to get queryId");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/data-kiosk/get-query`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        queryId
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Data Kiosk API - v2023-11-15 - CreateQuery</h2>
      <p style={styles.sub}>Submit GraphQL queries for Seller Sales and Traffic Data</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <label style={styles.label}>GraphQL Query</label>
        <textarea
          rows={8}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          style={styles.payloadArea}
          placeholder="query { analytics_salesAndTraffic_2023_11_15 { ... } }"
        />

        <div style={styles.row}>
          <button onClick={createQuery} disabled={loading} style={styles.btn}>
            {loading ? "Submitting..." : "Create Query"}
          </button>
          {queryId && (
            <button onClick={getQueryStatus} disabled={loading} style={styles.secondaryBtn}>
              Get Query Status - {queryId}
            </button>
          )}
        </div>

        {queryId && (
          <div style={styles.badge}>QueryId: {queryId}</div>
        )}
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Response</h3>
          <textarea rows={18} readOnly value={data} style={styles.payloadArea} />
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
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:10 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:200, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12, alignItems:"center" },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  badge: { background:"#e0f2fe", color:"#0369a1", padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, display:"inline-block", marginTop:10 }
};

export default CreateQuery;