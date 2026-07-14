import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorDisplay from "../Common/ErrorDisplay";

const Uploads = () => {
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
    const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
    const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
    const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
    const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

  /* Load Access Token from Local Storage */
  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");

    if (token) {
      setAccessToken(token);
    }
  }, []);

  /* Create Upload Destination */
  const createUploadDestination = async () => {
    if (!accessToken) {
      setError({
        message: "Access Token not found. Please generate the token first.",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-upload-destination",
        {
          accessToken,
           awsAccessKey,
           awsSecretKey,
           region,
          environment,
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data || { message: err.message });
    } finally {
      setLoading(false);
    }
  };

return (
  < div style={containerStyle} >
    <h2>Create Upload Destination</h2>

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

    <label>Region</label>
    <input
      type="text"
      value={region}
      onChange={(e) => setRegion(e.target.value)}
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
      onClick={createUploadDestination}
      disabled={loading}
      style={styles.button}
    >
      {loading
        ? "Creating..."
        : "Create Upload Destination"}
    </button>

    {result && (
      <pre style={styles.pre}>
        {JSON.stringify(result, null, 2)}
      </pre>
    )}

    {error && (
      <pre style={{ color: "red" }}>
        {typeof error === "string"
          ? error
          : JSON.stringify(error, null, 2)}
      </pre>
    )}
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
    minHeight: "120px",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    resize: "vertical",
  },

  button: {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  pre: {
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
export default Uploads;