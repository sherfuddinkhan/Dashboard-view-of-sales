import React, { useState,useEffect } from "react";
import axios from "axios";

const SendMessage = () => {
  const [accessToken, setAccessToken] = useState("");
  const [amazonOrderId, setAmazonOrderId] = useState("");
  const [message, setMessage] = useState("");
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
        "http://localhost:5000/messaging/send",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          amazonOrderId,
          text: message,
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
      <h2 style={styles.title}>Send Buyer Message</h2>

      <label>Access Token</label>
      <textarea
        rows={5}
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={styles.textArea}
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

      <label>Message</label>
      <textarea
        rows={6}
        style={styles.textArea}
        placeholder="Enter your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Message"}
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
    fontSize: "14px",
    boxSizing: "border-box",
  },

  textArea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 24px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "15px",
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
    color: "#b71c1c",
    borderRadius: "6px",
  },

  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowX: "auto",
  },
};

export default SendMessage;