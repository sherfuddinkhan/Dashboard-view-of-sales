import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetDocument = () => {
  const [accessToken, setAccessToken] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("production");
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

  const getDocument = async () => {
    if (!accessToken) return setError("Access Token required");
    if (!documentId) return setError("documentId required - from GetQuery response");
    if (!awsAccessKey ||!awsSecretKey) return setError("AWS credentials required");

    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/data-kiosk/get-document`, {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        environment,
        documentId: documentId.trim()
      });

      setData(JSON.stringify(res.data, null, 2));

      // Auto open presigned URL
      if (res.data?.url || res.data?.payload?.url) {
        const url = res.data.url || res.data.payload.url;
        window.open(url, "_blank");
      }
      if (res.data?.documentUrl) {
        window.open(res.data.documentUrl, "_blank");
      }
    } catch (err) {
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Data Kiosk API - Get Document - v2023-11-15</h2>
      <p style={styles.sub}>Get presigned URL for query results - Download CSV/JSONL after query completes</p>

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
            <input type="password" value={awsSecretKey} onChange={e=>setAwsSecretKey(e.target.value)} style={styles.input} placeholder="..." />
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
        </div>

        <label style={styles.label}>Document ID</label>
        <input value={documentId} onChange={e=>setDocumentId(e.target.value)} placeholder="DocumentId from GetQuery - e.g. amzn1.sp-doc.1.4.na.xxx" style={styles.input} />

        <button onClick={getDocument} disabled={loading} style={styles.btn}>
          {loading ? "Fetching..." : "Get Document URL"}
        </button>
        <div style={styles.hint}>Flow: CreateQuery → GetQuery (wait DONE) → GetDocument (this page) → Download URL</div>
      </div>

      {data && (
        <div style={styles.card}>
          <h3 style={{color:"green"}}>Document Response</h3>
          <textarea rows={15} readOnly value={data} style={styles.payloadArea} />
          <div style={styles.row}>
            <button onClick={()=>navigator.clipboard.writeText(data)} style={styles.secondaryBtn}>Copy JSON</button>
            <button onClick={()=>{
              try{
                const j = JSON.parse(data);
                const url = j.url || j.payload?.url || j.documentUrl;
                if(url) window.open(url,"_blank");
              }catch{}
            }} style={styles.secondaryBtn}>Open URL Again</button>
          </div>
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
  sub: { color:"#666", marginBottom:16, fontSize:13 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:12 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", boxSizing:"border-box" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12, boxSizing:"border-box" },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:300, background:"#f8fafc", boxSizing:"border-box" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c", boxSizing:"border-box" },
  row: { display:"flex", gap:12, marginTop:8 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600, marginTop:16 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"8px 14px", borderRadius:6, cursor:"pointer", marginTop:8 },
  hint: { fontSize:11, color:"#6b7280", marginTop:8 }
};

export default GetDocument;