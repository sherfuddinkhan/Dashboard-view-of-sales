import React, { useState, useEffect } from "react";
import axios from "axios";

const DeleteListing = () => {
  const [accessToken, setAccessToken] = useState("");
const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
const [serviceName, setServiceName] = useState("execute-api");
const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
const [sku, setSku] = useState("");

const [marketplaceId, setMarketplaceId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);

    const savedSellerId = localStorage.getItem("sellerId");
    if (savedSellerId) setSellerId(savedSellerId);

    const marketplace = JSON.parse(localStorage.getItem("amazonMarketplaceResponse") || "{}");
    if (marketplace.payload?.length) {
      setMarketplaceId(marketplace.payload[0].marketplace.id);
    }
  }, []);

  const deleteListing = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await axios.post("http://localhost:5000/api/listings/delete", {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        sellerId,
        sku,
        marketplaceIds: marketplaceId,
        environment
      });

      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error(err);
      setError(err.response?.data 
        ? JSON.stringify(err.response.data, null, 2) 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Delete Amazon Listing</h2>

      <label>Access Token</label>
      <textarea rows={4} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles.textArea} />

      <label>AWS Access Key</label>
      <input type="text" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} style={styles.input} />

      <label>AWS Secret Key</label>
      <input type="text" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} style={styles.input} />

      <label>Seller ID</label>
      <input type="text" value={sellerId} onChange={(e) => setSellerId(e.target.value)} style={styles.input} />

      <label>SKU to Delete</label>
      <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} style={styles.input} placeholder="e.g. GM-ZDPI-9B4E" />

      <label>Marketplace ID</label>
      <input type="text" value={marketplaceId} onChange={(e) => setMarketplaceId(e.target.value)} style={styles.input} />

      <label>Environment</label>
      <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={styles.input}>
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
      </select>

      <button onClick={deleteListing} disabled={loading} style={styles.button}>
        {loading ? "Deleting..." : "Delete Listing"}
      </button>

      {result && <pre style={styles.pre}>{result}</pre>}
      {error && <pre style={{ color: "red", background: "#ffecec", padding: "15px", borderRadius: "5px" }}>{error}</pre>}
    </div>
  );
};

const styles = {
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
    minHeight: "100px",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "monospace",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#d32f2f",   // Red for delete action
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px"
  },
  pre: {
    background: "#f5f5f5",
    padding: "15px",
    borderRadius: "5px",
    whiteSpace: "pre-wrap",
    overflowX: "auto"
  }
};

const containerStyle = {
  maxWidth: "800px",
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff"
};

export default DeleteListing;