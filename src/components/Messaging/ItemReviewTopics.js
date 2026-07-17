import React, { useState, useEffect } from "react";
import axios from "axios";

const ItemReviewTopics = () => {
  // Authentication & Infrastructure State
  const [accessToken, setAccessToken] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [serviceName, setServiceName] = useState(process.env.REACT_APP_AWS_SERVICE_NAME || "execute-api");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

  // Customer Feedback Parameters State
  const [asin, setAsin] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER"); // Default to US Marketplace
  const [sortBy, setSortBy] = useState("MENTIONS");

  // Telemetry & UI Handling State
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill active access token if stored locally
  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const getReviewTopics = async () => {
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const result = await axios.post(
        "http://localhost:5000/api/feedback/topics",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          serviceName,
          environment,
          asin,
          marketplaceId,
          sortBy,
        }
      );

      const responseString = JSON.stringify(result.data, null, 2);
      setResponse(responseString);
      
      // Store complete response context locally
      localStorage.setItem("amazonFeedbackTopicsResponse", responseString);
    } catch (err) {
      if (err.response) {
        setError(JSON.stringify(err.response.data, null, 2));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Amazon SP-API Customer Feedback Topics</h2>

      <label>Access Token</label>
      <textarea
        rows="5"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={styles.textarea}
        placeholder="Atc|..."
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

      <label>Child ASIN</label>
      <input
        type="text"
        value={asin}
        onChange={(e) => setAsin(e.target.value.trim())}
        placeholder="e.g., B0BT5K9B2T"
        style={styles.input}
      />

      <label>Marketplace ID</label>
      <input
        type="text"
        value={marketplaceId}
        onChange={(e) => setMarketplaceId(e.target.value.trim())}
        placeholder="e.g., ATVPDKIKX0DER"
        style={styles.input}
      />

      <label>Sort By</label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={styles.input}
      >
        <option value="MENTIONS">Volume of Mentions</option>
        <option value="STAR_RATING_IMPACT">Star Rating Impact</option>
      </select>

      <label>Region</label>
      <input
        type="text"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        style={styles.input}
      />

      <label>Service Name</label>
      <input
        type="text"
        value={serviceName}
        onChange={(e) => setServiceName(e.target.value)}
        style={styles.input}
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

      <button
        onClick={getReviewTopics}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Analyzing Feedback..." : "Get Item Review Topics"}
      </button>

      {response && (
        <>
          <h3>Response Data</h3>
          <textarea
            rows="15"
            value={response}
            readOnly
            style={styles.textarea}
          />
          <button
            onClick={() => navigator.clipboard.writeText(response)}
            style={styles.copyButton}
          >
            Copy Response
          </button>
        </>
      )}

      {error && (
        <>
          <h3 style={{ color: "red" }}>Error Context</h3>
          <pre style={styles.errorContainer}>{error}</pre>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: 700,
    margin: "40px auto",
    padding: 30,
    border: "1px solid #ddd",
    borderRadius: 10,
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    backgroundColor: "#fff"
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    marginTop: 5,
    fontSize: 15,
    boxSizing: "border-box",
    borderRadius: 4,
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    marginTop: 5,
    fontSize: 14,
    boxSizing: "border-box",
    borderRadius: 4,
    border: "1px solid #ccc",
    fontFamily: "monospace"
  },
  button: {
    background: "#146eb4",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    cursor: "pointer",
    fontSize: 16,
    borderRadius: 5,
    width: "100%",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20
  },
  copyButton: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: 5,
    fontSize: 14
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    color: "#c53030",
    padding: 15,
    borderRadius: 5,
    border: "1px solid #feb2b2",
    overflowX: "auto",
    fontFamily: "monospace"
  }
};

export default ItemReviewTopics;