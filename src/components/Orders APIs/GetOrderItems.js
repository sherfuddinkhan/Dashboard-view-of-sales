import React, { useState,useEffect } from "react";
import axios from "axios";

const GetOrderItems = () => {
  const [accessToken, setAccessToken] = useState("");
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [MarketplaceId, setMarketplaceId] = useState();
  const [error, setError] = useState("");
const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
  const [serviceName, setServiceName] = useState("execute-api");
  const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
  useEffect(() => {
         const token = localStorage.getItem("amazonAccessToken");
         if (token) {
             setAccessToken(token);
         }
         const marketplace = JSON.parse(
             localStorage.getItem("amazonMarketplaceResponse") || "{}"
         );
         if (marketplace.payload?.length) {
             setMarketplaceId(marketplace.payload[0].marketplace.id);
         }
     }, []);
const getOrderItems = async () => {
  if (!accessToken || !orderId) {
    setError("Access Token and Order ID are required");
    return;
  }
  if (!awsAccessKey || !awsSecretKey) {
    setError("AWS Access Key and Secret Key are required");
    return;
  }

  setLoading(true);
  setError("");
  setResult("");

  try {
    const response = await axios.post("http://localhost:5000/api/get-order-items", {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      orderId
    });

    setResult(JSON.stringify(response.data, null, 2));
  } catch (err) {
    setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  } finally {
    setLoading(false);
  }
};

return (
  <div style={containerStyle}>
    <h2>Get Order Items</h2>

    <label>Access Token</label>
    <textarea 
      rows={5} 
      value={accessToken} 
      onChange={(e) => setAccessToken(e.target.value)} 
      style={styles.textArea} 
    />

    <label>AWS Access Key</label>
    <input 
      type="text" 
      value={awsAccessKey} 
      onChange={(e) => setAwsAccessKey(e.target.value)} 
      style={styles.input} 
    />

    <label>AWS Secret Key</label>
    <input 
      type="password" 
      value={awsSecretKey} 
      onChange={(e) => setAwsSecretKey(e.target.value)} 
      style={styles.input} 
    />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div>
        <label>Environment</label>
        <select 
          value={environment} 
          onChange={(e) => setEnvironment(e.target.value)} 
          style={styles.input}
        >
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
      </div>
      <div>
        <label>Region</label>
        <input 
          type="text" 
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
          style={styles.input} 
        />
      </div>
    </div>

    <label>Order ID</label>
    <input 
      type="text" 
      value={orderId} 
      onChange={(e) => setOrderId(e.target.value)} 
      style={styles.input} 
      placeholder="026-1234567-1234567" 
    />

    <button onClick={getOrderItems} disabled={loading} style={styles.button}>
      {loading ? "Fetching..." : "Get Order Items"}
    </button>

    {result && <pre style={styles.pre}>{result}</pre>}
    {error && <pre style={{ color: "red" }}>{error}</pre>}
  </div>
);
};

const styles = {
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },

  textArea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  button: {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  response: {
    marginTop: "20px",
    padding: "15px",
    background: "#f5f5f5",
    borderRadius: "5px",
    whiteSpace: "pre-wrap",
  },
};

const containerStyle = {
  maxWidth: "800px",
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff",
};

export default GetOrderItems;