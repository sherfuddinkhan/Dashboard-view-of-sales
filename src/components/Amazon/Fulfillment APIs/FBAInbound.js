import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const FBAInbound = () => {
  const [accessToken, setAccessToken] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [shipmentStatus, setShipmentStatus] = useState("WORKING");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken") || localStorage.getItem("flipkartAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const loadShipments = async () => {
    if (!accessToken) return setError("Access Token missing");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/fba/inbound/shipments`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        marketplaceId,
        shipmentStatus
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Fulfillment Inbound API - v0 / v2024-03-20</h2>
      <p style={styles.sub}>Get Inbound Shipments / Inbound Plans</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <input value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Shipment Status</label>
            <select value={shipmentStatus} onChange={e=>setShipmentStatus(e.target.value)} style={styles.input}>
              <option>WORKING</option><option>SHIPPED</option><option>RECEIVING</option><option>CLOSED</option><option>CANCELLED</option>
            </select>
          </div>
        </div>

        <button onClick={loadShipments} disabled={loading} style={styles.btn}>
          {loading? "Loading..." : "Get Inbound Shipments"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Response</h3>
          <textarea rows={20} readOnly value={data} style={styles.payloadArea} />
          <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy</button>
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor:"red"}}>
          <h3 style={{color:"red"}}>Error</h3>
          <textarea rows={10} readOnly value={error} style={styles.errorArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:400, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12, marginBottom:12 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600, marginTop:10 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 }
};

export default FBAInbound; 

