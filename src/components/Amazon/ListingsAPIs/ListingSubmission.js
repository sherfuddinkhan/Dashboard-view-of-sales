import React, { useState ,useEffect} from "react";
import axios from "axios";

const ListingSubmission = () => {
  const [accessToken, setAccessToken] = useState("");
  const [feedDocumentId, setFeedDocumentId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
   const [marketplaceId, setMarketplaceId] = useState("");
  const [error, setError] = useState("");
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
   

  const submitListing = async () => {
    setLoading(true); setError(""); setResult("");
    try {
      const res = await axios.post("http://localhost:5000/api/listing-submission", { accessToken, feedDocumentId });
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setError(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={containerStyle}>
      <h2>Listing Submission (Feed)</h2>
      <label>Access Token</label>
      <textarea rows={5} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles. textArea} />
      <label>Feed Document ID</label>
      <input type="text" value={feedDocumentId} onChange={(e) => setFeedDocumentId(e.target.value)} style={styles.input} />
      <button onClick={submitListing} disabled={loading} style={styles.button}>
        {loading ? "Submitting..." : "Submit Listing Feed"}
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
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff",
};
export default ListingSubmission;