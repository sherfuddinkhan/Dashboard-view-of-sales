import React, { useEffect, useState } from "react";
import axios from "axios";

const CatalogSearch = () => {

    const [accessToken, setAccessToken] = useState("");
    const [awsAccessKey, setAwsAccessKey] = useState(process.env.REACT_APP_AWS_ACCESS_KEY_ID || "");
    const [awsSecretKey, setAwsSecretKey] = useState(process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "");
    const [region, setRegion] = useState(process.env.REACT_APP_AWS_REGION || "us-east-1");
    const [environment, setEnvironment] = useState(process.env.REACT_APP_AMAZON_ENVIRONMENT || "sandbox");

    const [marketplaceId, setMarketplaceId] = useState("");

    const [keywords, setKeywords] = useState("");

    const [identifiers, setIdentifiers] = useState("");

    const [identifiersType, setIdentifiersType] = useState("UPC");

    const [response, setResponse] = useState("");

    const [loading, setLoading] = useState(false);

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

            setMarketplaceId(
                marketplace.payload[0].marketplace.id
            );

        }

    }, []);

   const searchCatalog = async () => {

    setLoading(true);
    setResponse("");
    setError("");

    try {

        const payload = {

            accessToken,

            awsAccessKey,

            awsSecretKey,

            region,

            environment,

            marketplaceIds: [
                marketplaceId
            ],

            includedData: [
                "summaries",
                "images",
                "identifiers"
            ],

            pageSize: 20,

            locale: "en_US"

        };

        // Search by Keywords

        if (keywords.trim()) {

            payload.keywords = [
                keywords.trim()
            ];

        }

        // Search by Identifier

        else if (identifiers.trim()) {

            payload.identifiers = [
                identifiers.trim()
            ];

            payload.identifiersType = identifiersType;

        }

        const result = await axios.post(

            "http://localhost:5000/api/catalog/search",

            payload

        );

        setResponse(
            JSON.stringify(result.data, null, 2)
        );

        localStorage.setItem(
            "amazonCatalogSearch",
            JSON.stringify(result.data)
        );

        if (
            result.data.items &&
            result.data.items.length > 0
        ) {

            localStorage.setItem(
                "amazonASIN",
                result.data.items[0].asin
            );

        }

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

    <h2>Amazon Catalog Search</h2>

    <label>Access Token</label>

    <textarea
        rows={5}
        value={accessToken}
        onChange={(e)=>setAccessToken(e.target.value)}
        style={styles.textArea}
    />

    <h3>AWS Credentials</h3>

    <label>AWS Access Key</label>

    <input
        value={awsAccessKey}
        onChange={(e)=>setAwsAccessKey(e.target.value)}
        style={styles.input}
    />

    <label>AWS Secret Key</label>

    <input
        type="password"
        value={awsSecretKey}
        onChange={(e)=>setAwsSecretKey(e.target.value)}
        style={styles.input}
    />

    <label>Region</label>

    <input
        value={region}
        onChange={(e)=>setRegion(e.target.value)}
        style={styles.input}
    />

    <label>Environment</label>

    <select
        value={environment}
        onChange={(e)=>setEnvironment(e.target.value)}
        style={styles.input}
    >
        <option value="sandbox">Sandbox</option>
        <option value="production">Production</option>
    </select>

    <h3>Search Parameters</h3>

    <label>Marketplace ID</label>

    <input
        value={marketplaceId}
        onChange={(e)=>setMarketplaceId(e.target.value)}
        style={styles.input}
        placeholder="ATVPDKIKX0DER"
    />

    <label>Keywords</label>

    <input
        value={keywords}
        onChange={(e)=>setKeywords(e.target.value)}
        placeholder="Samsung TV"
        style={styles.input}
    />

    <h3 style={{textAlign:"center"}}>OR</h3>

    <label>Identifier</label>

    <input
        value={identifiers}
        onChange={(e)=>setIdentifiers(e.target.value)}
        placeholder="ASIN / UPC / EAN / GTIN"
        style={styles.input}
    />

    <label>Identifier Type</label>

    <select
        value={identifiersType}
        onChange={(e)=>setIdentifiersType(e.target.value)}
        style={styles.input}
    >
        <option value="ASIN">ASIN</option>
        <option value="UPC">UPC</option>
        <option value="EAN">EAN</option>
        <option value="GTIN">GTIN</option>
        <option value="ISBN">ISBN</option>
        <option value="JAN">JAN</option>
        <option value="SKU">SKU</option>
        <option value="MINSAN">MINSAN</option>
    </select>

    <label>Included Data</label>

    <select
        multiple
        value={includedData}
        onChange={(e)=>
            setIncludedData(
                Array.from(
                    e.target.selectedOptions,
                    option=>option.value
                )
            )
        }
        style={{...styles.input,height:180}}
    >
        <option value="summaries">summaries</option>
        <option value="attributes">attributes</option>
        <option value="images">images</option>
        <option value="dimensions">dimensions</option>
        <option value="identifiers">identifiers</option>
        <option value="relationships">relationships</option>
        <option value="salesRanks">salesRanks</option>
        <option value="productTypes">productTypes</option>
        <option value="classifications">classifications</option>
        <option value="vendorDetails">vendorDetails</option>
    </select>

    <label>Locale</label>

    <input
        value={locale}
        onChange={(e)=>setLocale(e.target.value)}
        placeholder="en_US"
        style={styles.input}
    />

    <label>Page Size</label>

    <input
        type="number"
        value={pageSize}
        onChange={(e)=>setPageSize(e.target.value)}
        style={styles.input}
    />

    <button
        onClick={searchCatalog}
        disabled={loading}
        style={styles.button}
    >
        {loading ? "Searching..." : "Search Catalog"}
    </button>

    {response && (
        <>
            <h3>Response</h3>

            <textarea
                rows={20}
                readOnly
                value={response}
                style={styles.textArea}
            />
        </>
    )}

    {error && (
        <>
            <h3 style={{color:"red"}}>Error</h3>

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

    container: {
        width: 700,
        margin: "30px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8
    },

    input: {
        width: "100%",
        padding: 10,
        marginBottom: 15
    },

    textarea: {
        width: "100%",
        padding: 10
    },

    button: {
        background: "#146eb4",
        color: "#fff",
        border: "none",
        padding: "12px 25px",
        cursor: "pointer",
        borderRadius: 5
    }

};

export default CatalogSearch;