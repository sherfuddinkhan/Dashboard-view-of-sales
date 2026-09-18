import React, { useState, useEffect } from "react";
import axios from "axios";

const Cancellations = () => {
  const [cancels, setCancels] = useState([]);
  const fetchCancels = async () => { try { const res = await axios.get("http://localhost:5000/api/flipkart/cancellations"); setCancels(res.data?.data || []); } catch(e){ console.error(e); } };
  useEffect(()=>{ fetchCancels(); },[]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>❌ Cancellations - API 14</h2>
      <p>GET /sellers/v3/cancellations | POST /sellers/v3/cancellations/approve</p>
      <button onClick={fetchCancels} style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", marginTop: "12px" }}>Fetch Cancellations</button>
      <table style={{ width: "100%", marginTop: "16px", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#f9fafb" }}><th style={{ padding: "10px", textAlign: "left" }}>Order ID</th><th>Reason</th><th>Action</th></tr></thead>
        <tbody>{cancels.length===0 ? <tr><td colSpan="3" style={{ padding: "20px", textAlign: "center" }}>No cancellations</td></tr> : cancels.map((c,i)=><tr key={i}><td style={{ padding: "10px" }}>{c.orderId}</td><td>{c.reason}</td><td><button style={{ padding: "4px 10px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px" }}>Approve</button></td></tr>)}</tbody>
      </table>
    </div>
  );
};
export default Cancellations;