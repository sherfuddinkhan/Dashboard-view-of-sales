import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const ReportsAPI = () => {
  const [accessToken, setAccessToken] = useState("");
  const [reportType, setReportType] = useState("GET_MERCHANT_LISTINGS_ALL_DATA");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [reportId, setReportId] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const REPORT_TYPES = [
    "GET_MERCHANT_LISTINGS_ALL_DATA",
    "GET_FBA_INVENTORY_AGED_DATA",
    "GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE",
    "GET_FLAT_FILE_OPEN_LISTINGS_DATA",
    "GET_FBA_FULFILLMENT_CUSTOMER_SHIPMENT_SALES_DATA",
    "GET_FBA_MYI_UNSUPPRESSED_INVENTORY",
    "GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL",
    "GET_V2_SELLER_PERFORMANCE_REPORT",
    "GET_SALES_AND_TRAFFIC_REPORT",
  ];

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const createReport = async () => {
    if (!accessToken) return setError("Access Token required");
    setLoading(true); setError(""); setData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/reports/create`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        reportType,
        marketplaceIds: [marketplaceId]
      });
      setData(JSON.stringify(res.data, null, 2));
      if (res.data.reportId) setReportId(res.data.reportId);
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  const getReport = async () => {
    if (!reportId) return setError("ReportId required - Create report first");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/reports/get`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        reportId
      });
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  const getDocument = async () => {
    const docId = prompt("Enter reportDocumentId from getReport response:");
    if (!docId) return;
    try {
      const res = await axios.post(`${NODE_API}/amazon/reports/document`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_KEY || "YOUR_AWS_KEY",
        awsSecretKey: process.env.REACT_APP_AWS_SECRET || "YOUR_AWS_SECRET",
        region: "us-east-1",
        environment: "production",
        documentId: docId
      });
      window.open(res.data.url, "_blank");
      setData(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Reports API - v2021-06-30</h2>
      <p style={styles.sub}>Create report → Poll status → Download document</p>

      <div style={styles.card}>
        <label style={styles.label}>Amazon Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{flex:2}}>
            <label style={styles.label}>Report Type</label>
            <select value={reportType} onChange={e=>setReportType(e.target.value)} style={styles.input}>
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Marketplace ID</label>
            <input value={marketplaceId} onChange={e=>setMarketplaceId(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.row}>
          <button onClick={createReport} disabled={loading} style={styles.btn}>{loading ? "Creating..." : "1. Create Report"}</button>
          <button onClick={getReport} disabled={loading || !reportId} style={styles.secondaryBtn}>2. Get Report Status</button>
          <button onClick={getDocument} disabled={loading} style={styles.secondaryBtn}>3. Get Document URL</button>
        </div>

        {reportId && <div style={styles.badge}>Last ReportId: {reportId}</div>}
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
  label: { display:"block", fontWeight:600, marginBottom:6, fontSize:13, marginTop:8 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db" },
  textArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:12 },
  payloadArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, minHeight:350, background:"#f8fafc" },
  errorArea: { width:"100%", padding:10, borderRadius:6, border:"1px solid #ef4444", fontFamily:"monospace", fontSize:12, color:"#b91c1c" },
  row: { display:"flex", gap:12, marginTop:12, flexWrap:"wrap" },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  badge: { background:"#e0f2fe", color:"#0369a1", padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, display:"inline-block", marginTop:10 }
};

export default ReportsAPI;