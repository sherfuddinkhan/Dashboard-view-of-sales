import React, { useState, useEffect } from "react";
import axios from "axios";

const UpdateListing = () => {
const [accessToken, setAccessToken] = useState("");
const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
const [serviceName, setServiceName] = useState("execute-api");
const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
const [sku, setSku] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default payload for Mouse (you can edit in the textarea)
  const defaultPayload = {
    "productType": "PRODUCT",
    "requirements": "LISTING",
    "attributes": {
      "item_name": [{ "value": "Wireless Ergonomic Computer Mouse" }],
      "brand": [{ "value": "TechGear" }],
      "manufacturer": [{ "value": "TechGear Electronics" }],
      "condition_type": [{ "value": "new_new" }],
      "product_description": [{ "value": "High-precision wireless mouse with ergonomic design for comfortable all-day use." }],
      "bullet_point": [
        { "value": "Ergonomic shape reduces hand fatigue" },
        { "value": "Silent click buttons for quiet operation" },
        { "value": "Adjustable DPI up to 3200" },
        { "value": "Up to 18 months battery life" }
      ],
      "color": [{ "value": "Black" }],
      "item_weight": [{ "value": 0.12, "unit": "kilograms" }],
      "main_product_image_locator": [{ "media_location": "https://yourdomain.com/images/wireless-mouse.jpg" }],
      "list_price": [{ "currency": "USD", "value": 29.99 }],
      "purchasable_offer": [{
        "currency": "USD",
        "our_price": [{ "schedule": [{ "value_with_tax": 24.99 }] }]
      }],
      "fulfillment_availability": [{ "fulfillment_channel_code": "DEFAULT", "quantity": 250 }]
    }
  };

  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2));

  useEffect(() => {
    const token = localStorage.getItem("amazonAccessToken");
    if (token) setAccessToken(token);

    // Load other credentials from localStorage if you saved them
    const savedSellerId = localStorage.getItem("sellerId");
    if (savedSellerId) setSellerId(savedSellerId);
  }, []);

  const updateListing = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const parsedPayload = JSON.parse(payload);

      const requestBody = {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        sellerId,
        sku,
        environment,
        region: "us-east-1",
        patches: [
          {
            "op": "replace",
            "path": "/attributes",
            "value": parsedPayload.attributes
          }
        ]
      };

      const res = await axios.post("http://localhost:5000/api/listings/update", requestBody);

      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error(err);
      setError(err.response?.data ? JSON.stringify(err.response.data, null, 2) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Update Amazon Listing</h2>

      <label>Access Token</label>
      <textarea rows={4} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={styles.textArea} />

      <label>AWS Access Key</label>
      <input type="text" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} style={styles.input} />

      <label>AWS Secret Key</label>
      <input type="text" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} style={styles.input} />

      <label>Seller ID</label>
      <input type="text" value={sellerId} onChange={(e) => setSellerId(e.target.value)} style={styles.input} />

      <label>SKU</label>
      <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} style={styles.input} placeholder="e.g. MOUSE-ERGONOMIC-001" />

      <label>Environment</label>
      <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={styles.input}>
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
      </select>

      <label>Product Data (JSON)</label>
      <textarea rows={12} value={payload} onChange={(e) => setPayload(e.target.value)} style={styles.textArea} />

      <button onClick={updateListing} disabled={loading} style={styles.button}>
        {loading ? "Updating..." : "Update Listing"}
      </button>

      {result && <pre style={styles.pre}>{result}</pre>}
      {error && <pre style={{ color: "red", background: "#ffecec", padding: "10px" }}>{error}</pre>}
    </div>
  );
};

const styles = {
  input: { width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px" },
  textArea: { width: "100%", minHeight: "120px", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px", fontFamily: "monospace", resize: "vertical" },
  button: { padding: "12px 24px", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  pre: { background: "#f5f5f5", padding: "15px", borderRadius: "5px", overflowX: "auto", whiteSpace: "pre-wrap" }
};

const containerStyle = {
  maxWidth: "900px",
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#fff"
};

export default UpdateListing;