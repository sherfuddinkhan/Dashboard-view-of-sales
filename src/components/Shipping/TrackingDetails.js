import React, { useState } from "react";
import axios from "axios";

const TrackingDetails = ({
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
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const getTracking = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/shipping/tracking",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          trackingId,
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
      <h2 style={styles.title}>Tracking Details</h2>

      <label>Access Token</label>

      <textarea
        rows={5}
        style={styles.textArea}
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
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

      <label>Tracking ID</label>

      <input
        style={styles.input}
        placeholder="Tracking ID"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={getTracking}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Tracking Details"}
      </button>

      {error && (
        <div style={styles.error}>
          <h3>Error</h3>
          <pre style={styles.pre}>{error}</pre>
        </div>
      )}

      {result && (
        <div style={styles.response}>
          <h3>Response</h3>
          <pre style={styles.pre}>{result}</pre>
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
    boxShadow: "0 2px 8px rgba(0,0,0,.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },

  textArea: {
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
    padding: "12px 24px",
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
    borderRadius: "6px",
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "6px",
  },

  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
  },
};

export default TrackingDetails;