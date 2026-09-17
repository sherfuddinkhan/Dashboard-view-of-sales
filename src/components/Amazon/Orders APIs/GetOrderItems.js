import React, { useState, useEffect } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetOrderItems = () => {
  const [accessToken, setAccessToken] = useState("");
  const [orderId, setOrderId] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);

    try {
      const marketplace = JSON.parse(localStorage.getItem("amazonMarketplaceResponse") || "{}");
      if (marketplace.payload?.length) {
        setMarketplaceId(marketplace.payload[0].marketplace.id);
      }
    } catch {}
  }, []);

  const getOrderItems = async () => {
    if (!accessToken ||!orderId) {
      setError("Access Token and Order ID are required");
      return;
    }
    if (!awsAccessKey ||!awsSecretKey) {
      setError("AWS Access Key and Secret Key are required");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await axios.post(`${NODE_API}/get-order-items`, {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        environment,
        orderId: orderId.trim(),
        marketplaceId
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      setError(err.response? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Orders API - GetOrderItems</h2>
      <p style={styles.sub}>v0 - Get order line items by OrderId</p>

      <div style={styles.card}>
        <label style={styles.label}>Access Token (LWA)</label>
        <textarea rows={3} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles.textArea} placeholder="Atza|..." />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>AWS Access Key</label>
            <input type="text" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>AWS Secret Key</label>
            <input type="password" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Environment</label>
            <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={styles.input}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Region</label>
            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Marketplace ID</label>
            <input type="text" value={marketplaceId} onChange={(e) => setMarketplaceId(e.target.value)} style={styles.input} />
          </div>
        </div>

        <label style={styles.label}>Order ID</label>
        <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} style={styles.input} placeholder="113-1234567-1234567" />

        <button onClick={getOrderItems} disabled={loading} style={styles.button}>
          {loading? "Fetching..." : "Get Order Items"}
        </button>
      </div>

      {result && (
        <div style={styles.card}>
          <h3 style={{ color: "green" }}>Response</h3>
          <textarea rows={20} readOnly value={result} style={styles.payloadArea} />
          <button onClick={() => navigator.clipboard.writeText(result)} style={styles.secondaryBtn}>Copy JSON</button>
        </div>
      )}

      {error && (
        <div style={{...styles.card, borderColor: "red" }}>
          <h3 style={{ color: "red" }}>Error</h3>
          <textarea rows={10} readOnly value={error} style={styles.errorArea} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 950, width: "95%", margin: "20px auto", fontFamily: "Inter, sans-serif" },
  title: { textAlign: "left", marginBottom: 4, color: "#111827" },
  sub: { color: "#6b7280", marginBottom: 16, fontSize: 13 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 },
  label: { display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13, marginTop: 10 },
  input: { width: "100%", padding: 10, marginBottom: 8, border: "1px solid #ccc", borderRadius: 6, fontSize: 14, boxSizing: "border-box" },
  textArea: { width: "100%", minHeight: 80, padding: 10, marginBottom: 12, border: "1px solid #ccc", borderRadius: 6, fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" },
  payloadArea: { width: "100%", padding: 10, border: "1px solid #146eb4", borderRadius: 6, fontFamily: "monospace", fontSize: 12, background: "#f8fafc", minHeight: 350, boxSizing: "border-box" },
  errorArea: { width: "100%", padding: 10, border: "1px solid #ef4444", borderRadius: 6, fontFamily: "monospace", fontSize: 12, color: "#b91c1c", boxSizing: "border-box" },
  button: { padding: "10px 20px", backgroundColor: "#146eb4", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, marginTop: 10 },
  secondaryBtn: { background: "#fff", border: "1px solid #d1d5db", padding: "8px 14px", borderRadius: 6, cursor: "pointer", marginTop: 8 },
  row: { display: "flex", gap: 12 }
};

export default GetOrderItems;