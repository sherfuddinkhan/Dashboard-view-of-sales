import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const ListingsRestrictions = () => {
  const [accessToken, setAccessToken] = useState("");
  const [asin, setAsin] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [conditionType, setConditionType] = useState("new_new");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
    const sid = localStorage.getItem("amazonSellerId");
    if (sid) setSellerId(sid);
  }, []);

  const checkRestrictions = async () => {
    if (!accessToken) return setError("Access Token required");
    if (!asin) return setError("ASIN required");
    if (!sellerId) return setError("Seller ID required");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/listings/restrictions`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        asin,
        sellerId,
        marketplaceIds: marketplaceId,
        conditionType
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Listings Restrictions API - v2021-08-01</h2>
      <p style={styles.sub}>Check if restrictions prevent creating a listing for an ASIN</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>ASIN</label>
            <input value={asin} onChange={e=>setAsin(e.target.value)} style={styles.input} placeholder="B0XXXXXXXX" />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Seller ID</label>
            <input value={sellerId} onChange={e=>setSellerId(e.target.value)} style={styles.input} placeholder="A2XXXXXXXXXXX" />
          </div>
        </div>

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <select value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input}>
              <option value="ATVPDKIKX0DER">US - ATVPDKIKX0DER</option>
              <option value="A21TJRUUN4KGV">India - A21TJRUUN4KGV</option>
              <option value="A1PA6795UKMFR9">DE - A1PA6795UKMFR9</option>
              <option value="A1F83G8C2ARO7P">UK - A1F83G8C2ARO7P</option>
              <option value="A1VC38T7YXB528">Japan - A1VC38T7YXB528</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Condition Type</label>
            <select value={conditionType} onChange={e=>setConditionType(e.target.value)} style={styles.input}>
              <option value="new_new">new_new</option>
              <option value="new_open_box">new_open_box</option>
              <option value="new_oem">new_oem</option>
              <option value="used_good">used_good</option>
            </select>
          </div>
        </div>

        <button onClick={checkRestrictions} disabled={loading} style={styles.btn}>
          {loading ? "Checking..." : "Check Restrictions"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Restrictions Response</h3>
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
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:350, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600, marginTop:12 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 }
};

export default ListingsRestrictions;