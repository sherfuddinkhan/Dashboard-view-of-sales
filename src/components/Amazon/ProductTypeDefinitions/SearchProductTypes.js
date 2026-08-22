import React, { useState ,useEffect} from "react";
import axios from "axios";

const SearchProductTypes = () => {
  const [accessToken, setAccessToken] = useState("");
 const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
 const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
  const [region, setRegion] = useState("us-east-1");
  const [environment, setEnvironment] = useState("sandbox");
  const [marketplaceIds, setMarketplaceIds] = useState("");

  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
  // Access Token
  const token = localStorage.getItem("amazonAccessToken");
  if (token) {
    setAccessToken(token);
  }

  // Marketplace Response
  const marketplaceData = JSON.parse(
    localStorage.getItem("amazonMarketplaceResponse") || "{}"
  );

  const marketplace = marketplaceData.payload?.[0];

  if (marketplace) {
    console.log("Marketplace ID:", marketplace.marketplace.id);
    console.log("Marketplace Name:", marketplace.marketplace.name);
    console.log("Country Code:", marketplace.marketplace.countryCode);
    console.log("Store Name:", marketplace.storeName);
    console.log("Is Participating:", marketplace.participation.isParticipating);
    setMarketplaceIds(marketplace.marketplace.id)
    
  }
}, []);
  const searchProductTypes= async () => {
    setLoading(true);
    setError("");
    setProductTypes([]);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/product-types/search",
        {
          accessToken,
          awsAccessKey,
          awsSecretKey,
          region,
          environment,
          marketplaceIds,
        }
      );

      setProductTypes(response.data.productTypes || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to fetch Product Types."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Search Product Types</h2>

      <input
        style={styles.input}
        placeholder="Access Token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="AWS Access Key"
        value={awsAccessKey}
        onChange={(e) => setAwsAccessKey(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="AWS Secret Key"
        value={awsSecretKey}
        onChange={(e) => setAwsSecretKey(e.target.value)}
      />

      <input
        style={styles.input}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />

      <select
        style={styles.input}
        value={environment}
        onChange={(e) => setEnvironment(e.target.value)}
      >
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
      </select>

      <input
        style={styles.input}
        value={marketplaceIds}
        onChange={(e) => setMarketplaceIds(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={searchProductTypes}
        disabled={loading}
      >
        {loading ? "Loading..." : "Search Product Types"}
      </button>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {productTypes.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Product Type</th>
              <th>Display Name</th>
              <th>Marketplace</th>
            </tr>
          </thead>

          <tbody>
            {productTypes.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.displayName}</td>
                <td>{marketplaceIds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
  },

  button: {
    padding: "10px 20px",
    cursor: "pointer",
  },

  error: {
    color: "red",
    marginTop: "15px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
};

export default SearchProductTypes;