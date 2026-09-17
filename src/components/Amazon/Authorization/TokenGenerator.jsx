import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const TokenGenerator = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cid = localStorage.getItem("amazonClientId");
    const secret = localStorage.getItem("amazonClientSecret");
    const rToken = localStorage.getItem("amazonRefreshToken");
    if (cid) setClientId(cid);
    if (secret) setClientSecret(secret);
    if (rToken) setRefreshToken(rToken);
  }, []);

  const generateToken = async () => {
    if (!clientId || !clientSecret || !refreshToken) {
      return setError("Client ID, Client Secret and Refresh Token are required");
    }
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/auth/token`, {
        clientId,
        clientSecret,
        refreshToken
      });

      setData(JSON.stringify(res.data, null, 2));

      if (res.data.access_token) {
        localStorage.setItem("amazonAccessToken", res.data.access_token);
        localStorage.setItem("amazonClientId", clientId);
        localStorage.setItem("amazonClientSecret", clientSecret);
        localStorage.setItem("amazonRefreshToken", refreshToken);
      }
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem("amazonAccessToken");
    setData(""); setError("");
  };

  return (
    <div style={styles.container}>
      <h2>Authorization API - LWA Token Generator</h2>
      <p style={styles.sub}>Authentication (LWA) - Get Access Token from Refresh Token - Valid 1 hour</p>

      <div style={styles.card}>
        <label style={styles.label}>LWA Client ID (SP-API App)</label>
        <input value={clientId} onChange={e=>setClientId(e.target.value)} style={styles.input} placeholder="amzn1.application-oa2-client.xxxxx" />

        <label style={styles.label}>LWA Client Secret</label>
        <input value={clientSecret} onChange={e=>setClientSecret(e.target.value)} type="password" style={styles.input} placeholder="amzn1.oa2-cs.v2.xxxxx" />

        <label style={styles.label}>Refresh Token (from Seller Auth)</label>
        <textarea rows={4} value={refreshToken} onChange={e=>setRefreshToken(e.target.value)} style={styles.textArea} placeholder="Atzr|IwEBI..." />

        <div style={styles.row}>
          <button onClick={generateToken} disabled={loading} style={styles.btn}>
            {loading ? "Generating..." : "Generate Access Token"}
          </button>
          <button onClick={clearTokens} style={styles.secondaryBtn}>Clear</button>
        </div>

        {data && (
          <div style={{marginTop:16}}>
            <h4 style={{color:"green"}}>Success - Token stored in localStorage</h4>
            <textarea rows={10} readOnly value={data} style={styles.payloadArea} />
            <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
          </div>
        )}
      </div>

      {error && (
        <div style={{...styles.card, borderColor:"red"}}>
          <h3 style={{color:"red"}}>Error</h3>
          <textarea rows={8} readOnly value={error} style={styles.errorArea} />
        </div>
      )}

      <div style={styles.note}>
        <b>Flow:</b> 1. Seller Authorizes App → 2. Get Refresh Token → 3. Exchange for Access Token (this page) → 4. Use Access Token + AWS SigV4 to call all SP-API
      </div>
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:12 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:200, background:"#f8fafc", marginTop:8 },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:16 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer" },
  note: { background:"#e0f2fe", border:"1px solid #bae6fd", padding:12, borderRadius:8, fontSize:13, color:"#0c4a6e" }
};

export default TokenGenerator;