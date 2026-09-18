import React, { useState, useEffect } from "react";
import axios from "axios";

const SellerProfile = () => {
  const [profile, setProfile] = useState(null);
  const fetchProfile = async () => { try{ const res = await axios.get("http://localhost:5000/api/flipkart/seller/profile"); setProfile(res.data); }catch(e){ console.error(e); } };
  useEffect(()=>{ fetchProfile(); },[]);

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>👤 Seller Profile & Performance - API 16</h2>
      <p>GET /sellers/v2/profile | GET /sellers/v2/performance | POST /sellers/webhooks</p>
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ padding: "16px", background: "#f3f4f6", borderRadius: "8px" }}><strong>Performance Score</strong><br/>⭐ 4.8/5<br/><small>On-time dispatch: 98%</small></div>
        <div style={{ padding: "16px", background: "#f3f4f6", borderRadius: "8px" }}><strong>Webhooks</strong><br/><input placeholder="Webhook URL" style={{ width: "100%", padding: "6px", marginTop: "8px", borderRadius: "4px", border: "1px solid #ddd" }} /><button style={{ marginTop: "8px", padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px" }}>Register Webhook</button></div>
      </div>
      {profile && <pre style={{ marginTop: "16px", background: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>{JSON.stringify(profile, null, 2)}</pre>}
    </div>
  );
};
export default SellerProfile;