import React, { useState } from "react";
import axios from "axios";

const AmazonTokenGenerator = () => {
  const [clientId, setClientId] = useState("process.env.REACT_APP_AMAZON_CLIENT_ID || \"\"");
  const [clientSecret, setClientSecret] = useState("process.env.REACT_APP_AMAZON_CLIENT_SECRET || \"\"");
  const [refreshToken, setRefreshToken] = useState("process.env.REACT_APP_AMAZON_REFRESH_TOKEN || \"\"");

  const [accessToken, setAccessToken] = useState("");
  const [expiresIn, setExpiresIn] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const generateToken = async () => {
  setLoading(true);
  setError("");
  setAccessToken("");

  try {
    const response = await axios.post(
      "http://localhost:5000/api/token",
      {
        clientId,
        clientSecret,
        refreshToken,
      }
    );

    setAccessToken(response.data.access_token);
    setExpiresIn(response.data.expires_in);
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
    <div
      style={{
        width: 700,
        margin: "40px auto",
        padding: 30,
        border: "1px solid #ddd",
        borderRadius: 10,
        fontFamily: "Arial",
      }}
    >
      <h2>Amazon SP-API Access Token Generator</h2>

      <br />

      <label>Client ID</label>

      <input
        type="text"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        style={styles.input}
      />

      <label>Client Secret</label>

      <input
        type="text"
        value={clientSecret}
        onChange={(e) => setClientSecret(e.target.value)}
        style={styles.input}
      />

      <label>Refresh Token</label>

      <textarea
        rows={4}
        value={refreshToken}
        onChange={(e) => setRefreshToken(e.target.value)}
        style={styles.textarea}
      />

      <button
        onClick={generateToken}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Generating..." : "Generate Access Token"}
      </button>

      <br />
      <br />

      {accessToken !== "" && (
        <>
          <h3>Access Token</h3>

          <textarea
            rows={8}
            value={accessToken}
            readOnly
            style={styles.textarea}
          />

          <h4>Expires In : {expiresIn} Seconds</h4>

          <button
            onClick={() => navigator.clipboard.writeText(accessToken)}
            style={styles.copyButton}
          >
            Copy Token
          </button>
        </>
      )}

      {error !== "" && (
        <>
          <h3 style={{ color: "red" }}>Error</h3>

          <pre>{error}</pre>
        </>
      )}
    </div>
  );
};

const styles = {
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    marginTop: 5,
    fontSize: 15,
  },

  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    marginTop: 5,
    fontSize: 14,
  },

  button: {
    background: "#146eb4",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    cursor: "pointer",
    fontSize: 16,
    borderRadius: 5,
  },

  copyButton: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: 5,
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

export default AmazonTokenGenerator;