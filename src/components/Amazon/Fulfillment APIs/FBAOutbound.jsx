import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const FBAOutbound = () => {
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("production");
  const [queryStartDate, setQueryStartDate] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("AFN");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
    const key = localStorage.getItem("amazonAwsKey") || process.env.REACT_APP_AWS_KEY || process.env.REACT_APP_AWS_ACCESS_KEY_ID || "";
    const secret = localStorage.getItem("amazonAwsSecret") || process.env.REACT_APP_AWS_SECRET || process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "";
    if (key) setAwsAccessKey(key);
    if (secret) setAwsSecretKey(secret);
  }, []);

  const listFulfillmentOrders = async () => {
    if (!accessToken) return setError("Access Token (LWA) required");
    if (!awsAccessKey ||!awsSecretKey) return setError("AWS Access Key and Secret required");

    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/fba/outbound/list`, {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        environment,
        queryStartDate: queryStartDate || undefined,
        fulfillmentMethod
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Fulfillment Outbound API - v2020-07-01</h2>
      <p style={styles.sub}>List All Fulfillment Orders - MCF, AFN - Amazon Fulfillment Network</p>

      <div style={styles.card}>
        <label style={styles.label}>Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>AWS Access Key</label>
            <input value={awsAccessKey} onChange={e=>setAwsAccessKey(e.target.value)} style={styles.input} placeholder="AKIA..." />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>AWS Secret Key</label>
            <input type="password" value={awsSecretKey} onChange={e=>setAwsSecretKey(e.target.value)} style={styles.input} placeholder="Secret" />
          </div>
        </div>

        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Region</label>
            <select value={region} onChange={e=>setRegion(e.target.value)} style={styles.input}>
              <option value="us-east-1">us-east-1 (NA)</option>
              <option value="eu-west-1">eu-west-1 (EU)</option>
              <option value="us-west-2">us-west-2 (FE)</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Environment</label>
            <select value={environment} onChange={e=>setEnvironment(e.target.value)} style={styles.input}>
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Fulfillment Method</label>
            <select value={fulfillmentMethod} onChange={e=>setFulfillmentMethod(e.target.value)} style={styles.input}>
              <option value="">All</option>
              <option value="AFN">AFN - Amazon Fulfillment Network</option>
              <option value="MFN">MFN - Merchant Fulfillment Network</option>
            </select>
          </div>
        </div>

        <label style={styles.label}>Query Start Date (Optional - ISO 8601)</label>
        <input type="datetime-local" value={queryStartDate} onChange={e=>setQueryStartDate(e.target.value)} style={styles.input} />

        <button onClick={listFulfillmentOrders} disabled={loading} style={styles.btn}>
          {loading ? "Loading..." : "List Fulfillment Orders"}
        </button>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Response - fulfillmentOrders</h3>
          <textarea readOnly rows={22} value={data} style={styles.payloadArea} />
          <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
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
  sub: { color:"#666", fontSize:13, marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:12 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", boxSizing:"border-box" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12, boxSizing:"border-box" },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:400, background:"#f8fafc", boxSizing:"border-box", marginTop:10 },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c", boxSizing:"border-box" },
  row: { display:"flex", gap:12, marginTop:8 },
  btn: { background:"#146eb4", color:"#fff", padding:"10px 18px", borderRadius:6, border:"none", cursor:"pointer", fontWeight:600, marginTop:16 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 }
};

export default FBAOutbound;