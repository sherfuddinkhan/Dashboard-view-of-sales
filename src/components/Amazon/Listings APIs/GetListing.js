import React, { useState,useEffect } from "react";
import axios from "axios";

const GetListing = () => {
  const [accessToken, setAccessToken] = useState("");
  const [sku, setSku] = useState("");
  const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
  const [serviceName, setServiceName] = useState("execute-api");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
   

 const getListing = async () => {
  if (!accessToken || !sellerId || !sku) {
    setError("Access Token, Seller ID and SKU are required.");
    return;
  }

  setLoading(true);
  setError("");
  setResult("");

  try {
    const response = await axios.post(
      "http://localhost:5000/api/listings/get",
      {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        serviceName,
        environment,
        sellerId,
        sku,
        marketplaceIds: [marketplaceId],
      }
    );

    setResult(JSON.stringify(response.data, null, 2));
  } catch (err) {
    setError(
      err.response
        ? JSON.stringify(err.response.data, null, 2)
        : err.message
    );
  } finally {
    setLoading(false);
  }
};

  return (
  <div style={styles.container}>
    <h2>Get Listing Details (Listings Items API)</h2>

    <label>Access Token</label>
    <textarea
      rows={5}
      value={accessToken}
      onChange={(e) => setAccessToken(e.target.value)}
      style={styles.textarea}
      placeholder="Paste your Amazon SP-API Access Token"
    />

    <label>AWS Access Key</label>
    <input
      type="text"
      value={awsAccessKey}
      onChange={(e) => setAwsAccessKey(e.target.value)}
      style={styles.input}
      placeholder="Enter AWS Access Key"
    />

    <label>AWS Secret Access Key</label>
    <input
      type="password"
      value={awsSecretKey}
      onChange={(e) => setAwsSecretKey(e.target.value)}
      style={styles.input}
      placeholder="Enter AWS Secret Access Key"
    />

    <label>AWS Region</label>
    <input
      type="text"
      value={region}
      onChange={(e) => setRegion(e.target.value)}
      style={styles.input}
      placeholder="us-east-1"
    />

    <label>AWS Service Name</label>
    <input
      type="text"
      value={serviceName}
      onChange={(e) => setServiceName(e.target.value)}
      style={styles.input}
      placeholder="execute-api"
    />

    <label>Environment</label>
    <select
      value={environment}
      onChange={(e) => setEnvironment(e.target.value)}
      style={styles.input}
    >
      <option value="sandbox">Sandbox</option>
      <option value="production">Production</option>
    </select>

    <label>Seller ID</label>
    <input
      type="text"
      value={sellerId}
      onChange={(e) => setSellerId(e.target.value)}
      style={styles.input}
      placeholder="Enter Amazon Seller ID"
    />

    <label>SKU</label>
    <input
      type="text"
      value={sku}
      onChange={(e) => setSku(e.target.value)}
      style={styles.input}
      placeholder="Enter Product SKU"
    />

    <label>Marketplace ID</label>
    <input
      type="text"
      value={marketplaceId}
      onChange={(e) => setMarketplaceId(e.target.value)}
      style={styles.input}
      placeholder="ATVPDKIKX0DER"
    />

    <button
      onClick={getListing}
      disabled={loading}
      style={styles.button}
    >
      {loading ? "Fetching Listing..." : "Get Listing Details"}
    </button>

    {result && (
      <>
        <h3>Response</h3>
        <pre style={styles.pre}>{result}</pre>

        <button
          onClick={() => navigator.clipboard.writeText(result)}
          style={styles.copyButton}
        >
          Copy Response
        </button>
      </>
    )}

    {error && (
      <>
        <h3 style={{ color: "red" }}>Error</h3>
        <pre style={{ color: "red" }}>{error}</pre>
      </>
    )}
  </div>
);
};




const styles = {
  input: {
    width: "100%",
    padding: 12,
    margin: "6px 0 16px 0",
    fontSize: 15,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: 12,
    margin: "6px 0 16px 0",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontFamily: "monospace",
  },
  button: {
    background: "#146eb4",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    cursor: "pointer",
    fontSize: 16,
    borderRadius: 6,
  },
  copyButton: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    cursor: "pointer",
    borderRadius: 6,
    marginTop: 10,
  },
  pre: {
    background: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    overflowX: "auto",
    maxHeight: "420px",
    whiteSpace: "pre-wrap",
    fontSize: 13,
  },
};
const containerStyle = {
  maxWidth: "800px",
  margin: "20px auto",
  padding: "20px",
};

export default GetListing;