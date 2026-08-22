import React, { useState,useEffect } from "react";
import axios from "axios";

const CreateListing = () => {
const [accessToken, setAccessToken] = useState("");
const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");
const [serviceName, setServiceName] = useState("execute-api");
const [sellerId, setSellerId] = useState("A13V1IB3VIYZZH");
const [sku, setSku] = useState("");

const [marketplaceId, setMarketplaceId] = useState("");
const defaultPayload = `{
  "productType": "PRODUCT",
  "requirements": "LISTING",
  "attributes": {
    "item_name": [
      {
        "value": "Wireless Bluetooth Mouse"
      }
    ],
    "brand": [
      {
        "value": "Logitech"
      }
    ],
    "manufacturer": [
      {
        "value": "Logitech"
      }
    ],
    "condition_type": [
      {
        "value": "new_new"
      }
    ]
  }
}`;
const addListing = () => {
  setListings([
    ...listings,
    {
      sku: "",
      payload: defaultPayload,
    }
  ]);
};
const removeListing = (index) => {
  setListings(listings.filter((_, i) => i !== index));
};

const updateSku = (index, value) => {
  const updated = [...listings];
  updated[index].sku = value;
  setListings(updated);
};

const updatePayload = (index, value) => {
  const updated = [...listings];
  updated[index].payload = value;
  setListings(updated);
};

const [listings, setListings] = useState([
  {
    sku: "",
    payload: defaultPayload,
  },
]);

const [loading, setLoading] = useState(false);
const [result, setResult] = useState("");
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

  const createBulkListings = async () => {
  setLoading(true);
  setError("");
  setResult("");

  try {
    const finalListings = listings.map((listing) => ({
      sku: listing.sku,
      payload: JSON.parse(listing.payload),
    }));

    const response = await axios.post(
      "http://localhost:5000/api/listings/bulk-create",
      {
        accessToken,
        awsAccessKey,
        awsSecretKey,
        region,
        serviceName,
        environment,
        sellerId,
        marketplaceIds: [marketplaceId],
        listings: finalListings,
      }
    );

    setResult(JSON.stringify(response.data, null, 2));
  } catch (err) {
    setError(
      err.response
        ? JSON.stringify(err.response.data, null, 2)
        : err.message
    );
  } finally {
    setLoading(false);
  }
};

 return (
  <div style={styles.container}>
    <h2>Create Listing (Listings Items API)</h2>

    <label>Access Token</label>
    <textarea
      rows={4}
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
      placeholder="us-east-1"
      style={styles.input}
    />

    <label>Service Name</label>
    <input
      type="text"
      value={serviceName}
      onChange={(e) => setServiceName(e.target.value)}
      placeholder="execute-api"
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

    <label>Seller ID</label>
    <input
      type="text"
      value={sellerId}
      onChange={(e) => setSellerId(e.target.value)}
      style={styles.input}
    />

    <label>Marketplace ID</label>
    <input
      type="text"
      value={marketplaceId}
      onChange={(e) => setMarketplaceId(e.target.value)}
      placeholder="ATVPDKIKX0DER"
      style={styles.input}
    />
    <h3>Listings</h3>

{listings.map((listing, index) => (
  <div
    key={index}
    style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "15px",
      marginBottom: "20px",
    }}
  >
    <h4>Listing {index + 1}</h4>

    <label>SKU</label>
    <input
      type="text"
      value={listing.sku}
      onChange={(e) => updateSku(index, e.target.value)}
      style={styles.input}
      placeholder="Enter SKU"
    />

    <label>Listing Payload (JSON)</label>
    <textarea
      rows={18}
      value={listing.payload}
      onChange={(e) => updatePayload(index, e.target.value)}
      style={styles.textArea}
    />

    {listings.length > 1 && (
      <button
        type="button"
        onClick={() => removeListing(index)}
        style={{
          ...styles.button,
          backgroundColor: "#dc3545",
          marginTop: "10px",
        }}
      >
        Remove Listing
      </button>
    )}
  </div>
))}

<button
  type="button"
  onClick={addListing}
  style={{
    ...styles.button,
    backgroundColor: "#28a745",
    marginRight: "10px",
  }}
>
  + Add Another Listing
</button>
    <button
  onClick={createBulkListings}
  disabled={loading}
  style={styles.button}
>
  {loading ? "Creating Listings..." : "Create Bulk Listings"}
</button>

    {result && (
      <>
        <h3>Response</h3>
        <pre style={styles.pre}>{result}</pre>
      </>
    )}

    {error && (
      <>
        <h3 style={{ color: "red" }}>Error</h3>
        <pre style={{ color: "red" }}>{error}</pre>
      </>
    )}
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
export default CreateListing;