import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductTypeDefinition = () => {

  const [accessToken, setAccessToken] = useState("");

  const [awsAccessKey, setAwsAccessKey] = useState(
    process.env.REACT_APP_AWS_ACCESS_KEY_ID || ""
  );

  const [awsSecretKey, setAwsSecretKey] = useState(
    process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ""
  );

  const [region, setRegion] = useState(
    process.env.REACT_APP_AWS_REGION || "us-east-1"
  );

  const [serviceName, setServiceName] = useState(
    process.env.REACT_APP_AWS_SERVICE_NAME || "execute-api"
  );

  const [environment, setEnvironment] = useState(
    process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox"
  );

  const [marketplaceIds, setMarketplaceIds] = useState("");

  const [productType, setProductType] = useState("");

  const [response, setResponse] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // Auto Populate Token & Marketplace Id
  useEffect(() => {

    const token = localStorage.getItem("amazonAccessToken");

    if (token) {
      setAccessToken(token);
    }

    const marketplaceData = JSON.parse(
      localStorage.getItem("amazonMarketplaceResponse") || "{}"
    );

    const marketplaceId =
      marketplaceData.payload?.[0]?.marketplace?.id || "";

    if (marketplaceId) {
      setMarketplaceIds(marketplaceId);
    }

  }, []);

  const downloadSchema = async () => {

    try {

        const definition = JSON.parse(
            localStorage.getItem("amazonProductTypeDefinition") || "{}"
        );

        const schemaUrl = definition.schema?.link?.resource;

        if (!schemaUrl) {
            alert("Schema URL not found.");
            return;
        }

        const result = await axios.post(
            "http://localhost:5000/api/product-types/schema",
            {
                accessToken,
                awsAccessKey,
                awsSecretKey,
                region,
                serviceName,
                schemaUrl,
                environment
            }
        );

        localStorage.setItem(
            "amazonProductSchema",
            JSON.stringify(result.data)
        );

        alert("Schema downloaded successfully.");

    } catch (err) {

        if (err.response) {

            alert(
                JSON.stringify(err.response.data, null, 2)
            );

        } else {

            alert(err.message);

        }

    }

};
  const getDefinition = async () => {

    setLoading(true);

    setError("");

    setResponse("");

    try {

      const result = await axios.post(

        "http://localhost:5000/api/product-types/definition",

        {

          accessToken,

          awsAccessKey,

          awsSecretKey,

          region,

          serviceName,

          marketplaceIds,

          productType,

          environment

        }

      );

      setResponse(
        JSON.stringify(result.data, null, 2)
      );

      // Save Complete Response
      localStorage.setItem(
        "amazonProductTypeDefinition",
        JSON.stringify(result.data)
      );

    }

    catch (err) {

      if (err.response) {

        setError(
          JSON.stringify(err.response.data, null, 2)
        );

      }

      else {

        setError(err.message);

      }

    }

    finally {

      setLoading(false);

    }

  };
const schema = JSON.parse(
    localStorage.getItem("amazonProductSchema") || "{}"
);

const definition = JSON.parse(
    localStorage.getItem("amazonProductTypeDefinition") || "{}"
);

console.log("Schema:", schema);

console.log("Schema URL:", definition.schema?.link?.resource);


console.log(schema);
    return (

    <div style={styles.container}>

      <h2>Amazon Product Type Definition</h2>

      <label>Access Token</label>

      <textarea
        rows={5}
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
        style={styles.textarea}
      />

      <label>Marketplace ID</label>

      <input
        type="text"
        value={marketplaceIds}
        onChange={(e) => setMarketplaceIds(e.target.value)}
        style={styles.input}
      />

      <label>Product Type</label>

      <input
        type="text"
        value={productType}
        onChange={(e) => setProductType(e.target.value.toUpperCase())}
        placeholder="Example : LUGGAGE"
        style={styles.input}
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
        style={styles.input}
      />

      <label>Service Name</label>

      <input
        type="text"
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
        <option value="sandbox">
          Sandbox
        </option>

        <option value="production">
          Production
        </option>
      </select>

      <button
        onClick={getDefinition}
        disabled={loading}
        style={styles.button}
      >
        {loading
          ? "Fetching..."
          : "Get Product Type Definition"}
      </button>

      <br />
      <br />

      {response && (

        <>

          <h3>Response</h3>

          <textarea
            rows={20}
            value={response}
            readOnly
            style={styles.textarea}
          />

          <button
            style={styles.copyButton}
            onClick={() =>
              navigator.clipboard.writeText(response)
            }
          >
            Copy Response
          </button>
          <button
    onClick={downloadSchema}
    style={{
        ...styles.button,
        marginLeft: 10,
        background: "#28a745"
    }}
>
    Download Schema
</button>

        </>

      )}

      {error && (

        <>

          <h3 style={{ color: "red" }}>
            Error
          </h3>

          <pre>{error}</pre>

        </>

      )}

    </div>

  );

};
const styles = {

  container: {
    width: 700,
    margin: "40px auto",
    padding: 30,
    border: "1px solid #ddd",
    borderRadius: 10,
    fontFamily: "Arial",
    background: "#fff"
  },

  input: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    fontSize: 15,
    borderRadius: 5,
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },

  textarea: {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    borderRadius: 5,
    border: "1px solid #ccc",
    resize: "vertical",
    boxSizing: "border-box"
  },

  button: {
    background: "#146eb4",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    cursor: "pointer",
    fontSize: 16,
    borderRadius: 5
  },

  copyButton: {
    background: "green",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: 5
  }

};

export default ProductTypeDefinition;