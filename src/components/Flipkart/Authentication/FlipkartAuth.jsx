import React, { useState } from "react";
import axios from "axios";

const FlipkartAuth = () => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const generateToken = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/flipkart/auth/token", { clientId, clientSecret });
      setToken(res.data?.access_token || JSON.stringify(res.data));
      localStorage.setItem("flipkart_token", res.data?.access_token);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "12px" }}>
      <h2>🔑 Flipkart OAuth Token Generator - API 9</h2>
      <p>POST /oauth-service/oauth/token</p>
      <div style={{ marginTop: "20px", maxWidth: "500px" }}>
        <input placeholder="Client ID" value={clientId} onChange={e=>setClientId(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
        <input placeholder="Client Secret" value={clientSecret} onChange={e=>setClientSecret(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd" }} />
        <button onClick={generateToken} disabled={loading} style={{ background: "#2874f0", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "6px" }}>{loading ? "Generating..." : "Generate Token"}</button>
        {token && <div style={{ marginTop: "16px", padding: "12px", background: "#f3f4f6", borderRadius: "6px", wordBreak: "break-all" }}><strong>Token:</strong> {token}</div>}
      </div>
    </div>
  );
};
export default FlipkartAuth;