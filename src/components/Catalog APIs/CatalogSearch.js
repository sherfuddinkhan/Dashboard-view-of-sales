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

            const result = await axios.post(

                "http://localhost:5000/api/catalog/search",

                {
                    accessToken,
                    awsAccessKey,
                    awsSecretKey,
                    region,
                    environment,
                    marketplaceId,
                    keywords,
                    identifiers,
                    identifiersType
                }

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

            <h2>Amazon Catalog Item Search</h2>

            <label>Marketplace ID</label>

            <input
                value={marketplaceId}
                onChange={(e) => setMarketplaceId(e.target.value)}
                style={styles.input}
            />

            <label>Keywords</label>

            <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Travel Bag"
                style={styles.input}
            />

            <h3 style={{ textAlign: "center" }}>OR</h3>

            <label>Identifier</label>

            <input
                value={identifiers}
                onChange={(e) => setIdentifiers(e.target.value)}
                placeholder="UPC / EAN / GTIN / ASIN"
                style={styles.input}
            />

            <label>Identifier Type</label>

            <select
                value={identifiersType}
                onChange={(e) => setIdentifiersType(e.target.value)}
                style={styles.input}
            >

                <option>ASIN</option>
                <option>UPC</option>
                <option>EAN</option>
                <option>GTIN</option>
                <option>ISBN</option>
                <option>SKU</option>

            </select>

            <button
                onClick={searchCatalog}
                style={styles.button}
                disabled={loading}
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
                        style={styles.textarea}
                    />
                </>

            )}

            {error && (

                <pre style={{ color: "red" }}>
                    {error}
                </pre>

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