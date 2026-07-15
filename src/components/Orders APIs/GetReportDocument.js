import React, { useState } from "react";
import axios from "axios";

const GetReportDocument = () => {
  const [accessToken, setAccessToken] = useState("");
  const [reportDocumentId, setReportDocumentId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
    const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
    const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
    const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
    const [serviceName, setServiceName] = useState("execute-api");
    const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
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
 const getReportDocument = async () => {
  if (!accessToken || !reportDocumentId) {
    setError("Access Token and Report Document ID are required");
    return;
  }
  if (!awsAccessKey || !awsSecretKey) {
    setError("AWS Access Key and Secret Key are required");
    return;
  }

  setLoading(true);
  setError("");
  setResult("");

  try {
    const response = await axios.post("http://localhost:5000/api/get-report-document", {
      accessToken,
      awsAccessKey,
      awsSecretKey,
      region,
      serviceName,
      environment,
      reportDocumentId
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
    <h2>Get Report Document</h2>

    <label>Access Token</label>
    <textarea 
      rows={5} 
      value={accessToken} 
      onChange={(e) => setAccessToken(e.target.value)} 
      style={styles.textarea} 
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

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div>
        <label>Environment</label>
        <select 
          value={environment} 
          onChange={(e) => setEnvironment(e.target.value)} 
          style={styles.input}
        >
          <option value="sandbox">Sandbox</option>
          <option value="production">Production</option>
        </select>
      </div>
      <div>
        <label>Region</label>
        <input 
          type="text" 
          value={region} 
          onChange={(e) => setRegion(e.target.value)} 
          style={styles.input} 
        />
      </div>
    </div>

    <label>Report Document ID</label>
    <input 
      type="text" 
      value={reportDocumentId} 
      onChange={(e) => setReportDocumentId(e.target.value)} 
      style={styles.input} 
      placeholder="amzn1.sp.report..." 
    />

    <button onClick={getReportDocument} disabled={loading} style={styles.button}>
      {loading ? "Fetching..." : "Get Report Document"}
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
   textarea: {
    width: "100%",
    padding: 12,
    margin: "6px 0 16px 0",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontFamily: "monospace",
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

export default GetReportDocument;