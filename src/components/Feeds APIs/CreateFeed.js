import React, { useState,useEffect} from "react";
import axios from "axios";

const CreateFeed = () => {
  const [accessToken, setAccessToken] = useState("");
  const [feedType, setFeedType] = useState("POST_PRODUCT_DATA");
  const [feedDocumentId, setFeedDocumentId] = useState("");
  const [marketplaceIds, setMarketplaceIds] = useState("ATVPDKIKX0DER");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
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

  const createFeed = async () => {
    if (!accessToken || !feedDocumentId) return setError("Access Token and Feed Document ID are required");

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await axios.post("http://localhost:5000/api/create-feed", {
        accessToken,
        feedType,
        feedDocumentId,
        marketplaceIds: marketplaceIds.split(",").map(id => id.trim()),
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
      <h2>Create Feed (Submit Feed)</h2>

      <label>Access Token</label>
      <textarea rows={5} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles.textArea} />

      <label>Feed Type</label>
      <input type="text" value={feedType} onChange={(e) => setFeedType(e.target.value)} style={styles.input} />

      <label>Feed Document ID</label>
      <input type="text" value={feedDocumentId} onChange={(e) => setFeedDocumentId(e.target.value)} style={styles.input} />

      <label>Marketplace IDs (comma separated)</label>
      <input type="text" value={marketplaceIds} onChange={(e) => setMarketplaceIds(e.target.value)} style={styles.input} />

      <button onClick={createFeed} disabled={loading} style={styles.button}>
        {loading ? "Submitting..." : "Create & Submit Feed"}
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
export default CreateFeed;