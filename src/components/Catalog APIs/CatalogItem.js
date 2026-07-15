import React, { useState,useEffect} from "react";
import axios from "axios";

const CatalogItem = () => {
  const [accessToken, setAccessToken] = useState("");
  const [asin, setAsin] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER"); // US default
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
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
 

const getCatalogItem = async () => {
  console.log({ accessToken, asin, marketplaceId, region, environment }); // DEBUG THIS

  if (!accessToken || !asin || !marketplaceId) {
    setError("Access Token, ASIN, and Marketplace ID are required");
    return;
  }

  setLoading(true);
  setError("");
  setResult("");

  try {
    const response = await axios.post(
      "http://localhost:5000/api/catalog-item",
      {
        accessToken: accessToken.trim(),
        awsAccessKey: awsAccessKey.trim(),
        awsSecretKey: awsSecretKey.trim(),
        region: region || "us-east-1",
        environment: environment || "production", // FORCE production for catalog
        asin: asin.trim(),
        marketplaceId: marketplaceId.trim() // must be ATVPDKIKX0DER for US
      }
    );
    setResult(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log("FULL ERROR FROM BACKEND:", err.response?.data);
    const errorData = err.response?.data || err.message;
    setError(typeof errorData === 'string' ? errorData : JSON.stringify(errorData, null, 2));
  } finally {
    setLoading(false);
  }
};

 return (
  <div style={containerStyle}>
    <h2>Catalog Item Lookup</h2>

    {/* Amazon Access Token */}
    <label>Access Token</label>
    <textarea
      rows={5}
      value={accessToken}
      onChange={(e) => setAccessToken(e.target.value)}
      style={styles.textArea}
      placeholder="Paste Amazon Access Token"
    />

    {/* AWS Credentials */}
    <h3 style={{ marginTop: "20px" }}>AWS Credentials</h3>

    <label>AWS Access Key</label>
    <input
      type="text"
      value={awsAccessKey}
      onChange={(e) => setAwsAccessKey(e.target.value)}
      style={styles.input}
      placeholder="AKIAXXXXXXXXXXXXXXXX"
    />

    <label>AWS Secret Key</label>
    <input
      type="password"
      value={awsSecretKey}
      onChange={(e) => setAwsSecretKey(e.target.value)}
      style={styles.input}
      placeholder="AWS Secret Access Key"
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
  <option value="production">Production</option>
  <option value="sandbox">Sandbox</option>
</select>

    {/* Catalog Details */}
    <h3 style={{ marginTop: "20px" }}>Catalog Details</h3>

    <label>ASIN</label>
    <input
      type="text"
      value={asin}
      onChange={(e) => setAsin(e.target.value)}
      style={styles.input}
      placeholder="B0ABC12345"
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
      onClick={getCatalogItem}
      disabled={loading}
      style={styles.button}
    >
      {loading ? "Fetching..." : "Get Catalog Item"}
    </button>

    {result && (
      <div style={{ marginTop: "20px" }}>
        <h3>Response</h3>
        <pre style={styles.pre}>{result}</pre>
      </div>
    )}

    {error && (
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "red" }}>Error</h3>
        <pre style={{ color: "red" }}>{error}</pre>
      </div>
    )}
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
};

export default CatalogItem;