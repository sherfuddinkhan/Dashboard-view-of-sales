import React, { useState,useEffect} from "react";
import axios from "axios";

const CatalogItem = () => {
  const [accessToken, setAccessToken] = useState("");
  const [asin, setAsin] = useState("");
  const [marketplaceId, setMarketplaceId] = useState("ATVPDKIKX0DER"); // US default
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
 

const getCatalogItem = async () => {

    if (!accessToken || !asin || !marketplaceId) {
        setError("Access Token, ASIN and Marketplace ID are required.");
        return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {

        const response = await axios.post(
            "http://localhost:5000/api/catalog-item",
            {

                accessToken,

                awsAccessKey,

                awsSecretKey,

                region,

                environment,

                // Swagger Parameters
                asin,

                marketplaceIds: [
                    marketplaceId
                ],

                includedData: [
                    "summaries",
                    "attributes",
                    "images",
                    "dimensions",
                    "identifiers",
                    "productTypes",
                    "relationships",
                    "salesRanks"
                ],

                locale: "en_US"

            }
        );

        setResult(
            JSON.stringify(response.data, null, 2)
        );

    }
    catch (err) {

        setError(
            err.response
                ? JSON.stringify(err.response.data, null, 2)
                : err.message
        );

    }
    finally {

        setLoading(false);

    }

};

return (
    <div style={styles.container}>

        <h2>Amazon Catalog Item</h2>

        {/* Access Token */}

        <label>Access Token</label>

        <textarea
            rows={5}
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            style={styles.textArea}
            placeholder="Paste Amazon Access Token"
        />

        {/* AWS Credentials */}

        <h3>AWS Credentials</h3>

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
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={styles.input}
        />

        <label>Service Name</label>

        <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
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

        <h3>Catalog Item Parameters</h3>

        <label>ASIN</label>

        <input
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
            placeholder="B07N4M94X4"
            style={styles.input}
        />

        <label>Marketplace ID</label>

        <input
            value={marketplaceId}
            onChange={(e) => setMarketplaceId(e.target.value)}
            placeholder="ATVPDKIKX0DER"
            style={styles.input}
        />

        <label>Included Data</label>

        <select
            multiple
            value={includedData}
            onChange={(e) =>
                setIncludedData(
                    Array.from(
                        e.target.selectedOptions,
                        option => option.value
                    )
                )
            }
            style={{ ...styles.input, height: 180 }}
        >
            <option value="summaries">summaries</option>
            <option value="attributes">attributes</option>
            <option value="images">images</option>
            <option value="dimensions">dimensions</option>
            <option value="identifiers">identifiers</option>
            <option value="productTypes">productTypes</option>
            <option value="relationships">relationships</option>
            <option value="salesRanks">salesRanks</option>
            <option value="classifications">classifications</option>
            <option value="vendorDetails">vendorDetails</option>
        </select>

        <label>Locale</label>

        <input
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en_US"
            style={styles.input}
        />

        <button
            onClick={getCatalogItem}
            disabled={loading}
            style={styles.button}
        >
            {loading ? "Fetching..." : "Get Catalog Item"}
        </button>

        {result && (
            <>
                <h3>Response</h3>

                <textarea
                    rows={20}
                    readOnly
                    value={result}
                    style={styles.textArea}
                />
            </>
        )}

        {error && (
            <>
                <h3 style={{ color: "red" }}>Error</h3>

                <textarea
                    rows={10}
                    readOnly
                    value={error}
                    style={styles.textArea}
                />
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

export default CatalogItem;