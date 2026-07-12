import React, { useState } from "react";
import axios from "axios";

const Messaging = ({
  accessToken,
  setAccessToken,
  awsAccessKey,
  setAwsAccessKey,
  awsSecretKey,
  setAwsSecretKey,
  region,
  setRegion,
  environment,
  setEnvironment,
}) => {
  const [amazonOrderId, setAmazonOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/messaging/actions",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          amazonOrderId,
        }
      );

      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      setError(
        JSON.stringify(err.response?.data || err.message, null, 2)
      );
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Messaging API</h2>

      <label>Access Token</label>
      <textarea
        rows={4}
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={styles.textarea}
      />

      <label>AWS Access Key</label>
      <input
        style={styles.input}
        value={awsAccessKey}
        onChange={(e) => setAwsAccessKey(e.target.value)}
      />

      <label>AWS Secret Key</label>
      <input
        type="password"
        style={styles.input}
        value={awsSecretKey}
        onChange={(e) => setAwsSecretKey(e.target.value)}
      />

      <label>Region</label>
      <input
        style={styles.input}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />

      <label>Environment</label>
      <select
        style={styles.input}
        value={environment}
        onChange={(e) => setEnvironment(e.target.value)}
      >
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
      </select>

      <label>Amazon Order ID</label>
      <input
        style={styles.input}
        placeholder="902-3159896-1390916"
        value={amazonOrderId}
        onChange={(e) => setAmazonOrderId(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Messaging Actions"}
      </button>

      {error && (
        <div style={styles.error}>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div style={styles.response}>
          <h3>Response</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "850px",
    margin: "20px auto",
    padding: "25px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "vertical",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 25px",
    background: "#1976d2",
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
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#b71c1c",
    borderRadius: "5px",
  },
};

export default Messaging;