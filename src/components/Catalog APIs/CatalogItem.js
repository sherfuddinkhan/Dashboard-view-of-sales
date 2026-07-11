import React, { useState } from "react";
import axios from "axios";

const CatalogItem = () => {
  const [accessToken, setAccessToken] = useState("");
  const [asin, setAsin] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER"); // US default
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCatalogItem = async () => {
    if (!accessToken || !asin || !marketplaceId) {
      setError("Access Token, ASIN, and Marketplace ID are required");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await axios.post("http://localhost:5000/api/catalog-item", {
        accessToken,
        asin,
        marketplaceId,
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
      <h2>Catalog Item Lookup</h2>

      <label>Access Token</label>
      <textarea rows={5} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles.textarea} />

      <label>ASIN</label>
      <input type="text" value={asin} onChange={(e) => setAsin(e.target.value)} style={styles.input} placeholder="B0ABC12345" />

      <label>Marketplace ID</label>
      <input type="text" value={marketplaceId} onChange={(e) => setMarketplaceId(e.target.value)} style={styles.input} />

      <button onClick={getCatalogItem} disabled={loading} style={styles.button}>
        {loading ? "Fetching..." : "Get Catalog Item"}
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