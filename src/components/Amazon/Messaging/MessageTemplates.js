import React, { useState,useEffect} from "react";
import axios from "axios";

const MessageTemplates = () => {
   const [accessToken, setAccessToken] = useState("");
  const [amazonOrderId, setAmazonOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
  const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
  const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
   useEffect(() => {
             const token = localStorage.getItem("amazonAccessToken");
             if (token) {
                 setAccessToken(token);
             }
         }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/messaging/templates",
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
      <h2 style={styles.title}>Message Templates</h2>

      <label>Access Token</label>
      <textarea
        rows={5}
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
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? "Loading..." : "Get Message Templates"}
      </button>

      {error && (
        <div style={styles.error}>
          <h3>Error</h3>
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
    boxShadow: "0 2px 8px rgba(0,0,0,.1)",
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
    borderRadius: "5px",
  },

  error: {
    marginTop: "20px",
    padding: "15px",
    background: "#ffebee",
    color: "#c62828",
    borderRadius: "5px",
  },
};

export default MessageTemplates;