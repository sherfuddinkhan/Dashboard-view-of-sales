import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentsSettlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchSettlements = async () => { try{ setLoading(true); const res = await axios.get("http://localhost:5000/api/flipkart/settlements"); setSettlements(res.data?.data || []); }catch(e){ console.error(e); }finally{ setLoading(false); } };
  useEffect(()=>{ fetchSettlements(); },[]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>💲 Payments & Settlements - API 15</h2>
      <p>GET /sellers/v3/settlements | GET /sellers/v3/transactions</p>
      <button onClick={fetchSettlements} style={{ padding: "8px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", marginTop: "12px" }}>Fetch Settlements</button>
      <div style={{ marginTop: "16px" }}>{loading ? "Loading..." : settlements.length===0 ? "No settlements - Connect backend" : <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr style={{ background: "#f9fafb" }}><th style={{ padding: "10px" }}>Settlement ID</th><th>Amount</th><th>Date</th></tr></thead><tbody>{settlements.map((s,i)=><tr key={i}><td style={{ padding: "10px" }}>{s.settlementId}</td><td>₹{s.amount}</td><td>{s.date}</td></tr>)}</tbody></table>}</div>
    </div>
  );
};
export default PaymentsSettlements;