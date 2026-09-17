import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetOrderDetails = () => {
  const [accessToken, setAccessToken] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState("");
  const [itemsData, setItemsData] = useState("");
  const [activeTab, setActiveTab] = useState("order");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);
  }, []);

  const getOrder = async () => {
    if (!accessToken) return setError("Access Token required");
    if (!orderId) return setError("Order ID required - e.g. 112-1234567-1234567");
    setLoading(true); setError(""); setOrderData(""); setItemsData("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/orders/get`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        awsSecretKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
        environment: "production",
        orderId: orderId.trim()
      });
      setOrderData(JSON.stringify(res.data, null, 2));
      setActiveTab("order");
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  const getOrderItems = async () => {
    if (!accessToken || !orderId) return setError("Token and Order ID required");
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${NODE_API}/amazon/orders/items`, {
        accessToken,
        awsAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        awsSecretKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
        environment: "production",
        orderId: orderId.trim()
      });
      setItemsData(JSON.stringify(res.data, null, 2));
      setActiveTab("items");
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <h2>Orders APIs - GetOrder + GetOrderItems</h2>
      <p style={styles.sub}>v0 - Fetch order details and line items - This is GetOrderDetails.jsx</p>

      <div style={styles.card}>
        <label style={styles.label}>Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={e=>setAccessToken(e.target.value)} style={styles.input} placeholder="Atza|..." />

        <label style={styles.label}>Amazon Order ID</label>
        <input value={orderId} onChange={e=>setOrderId(e.target.value)} style={styles.input} placeholder="112-1234567-1234567" />

        <div style={styles.row}>
          <button onClick={getOrder} disabled={loading} style={styles.btn}>{loading?"Loading...":"1. Get Order"}</button>
          <button onClick={getOrderItems} disabled={loading} style={styles.secondaryBtn}>2. Get Order Items</button>
        </div>
      </div>

      {(orderData || itemsData) && (
        <div style={styles.card}>
          <div style={styles.tabs}>
            <button onClick={()=>setActiveTab("order")} style={{...styles.tab, ...(activeTab==="order"?styles.tabActive:{})}}>Order Details</button>
            <button onClick={()=>setActiveTab("items")} style={{...styles.tab, ...(activeTab==="items"?styles.tabActive:{})}}>Order Items</button>
          </div>
          <textarea rows={24} readOnly value={activeTab==="order"?orderData:itemsData} style={styles.payload} />
          <button onClick={()=>navigator.clipboard.writeText(activeTab==="order"?orderData:itemsData)} style={styles.secondaryBtn}>Copy JSON</button>
        </div>
      )}

      {error && <div style={{...styles.card, borderColor:"red"}}><pre style={{color:"red", whiteSpace:"pre-wrap"}}>{error}</pre></div>}
    </div>
  );
};

const styles = {
  container: { width: 950, maxWidth:"95%", margin:"20px auto", fontFamily:"Inter, sans-serif" },
  sub: { color:"#666", fontSize:13, marginBottom:16 },
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 },
  label: { display:"block", fontWeight:600, fontSize:13, marginTop:10, marginBottom:6 },
  input: { width:"100%", padding:10, borderRadius:6, border:"1px solid #d1d5db", fontFamily:"monospace", fontSize:13, boxSizing:"border-box" },
  payload: { width:"100%", padding:10, borderRadius:6, border:"1px solid #146eb4", fontFamily:"monospace", fontSize:12, background:"#f8fafc", minHeight:400, boxSizing:"border-box" },
  row: { display:"flex", gap:12, marginTop:12 },
  btn: { background:"#146eb4", color:"#fff", border:"none", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  secondaryBtn: { background:"#fff", border:"1px solid #d1d5db", padding:"10px 18px", borderRadius:6, cursor:"pointer", fontWeight:600 },
  tabs: { display:"flex", gap:8, marginBottom:12 },
  tab: { padding:"8px 14px", border:"1px solid #e5e7eb", borderRadius:6, background:"#fff", cursor:"pointer" },
  tabActive: { background:"#146eb4", color:"#fff", borderColor:"#146eb4" }
};

export default GetOrderDetails;