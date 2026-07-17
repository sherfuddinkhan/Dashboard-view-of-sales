import React, { useState } from "react";
import axios from "axios";
import "./ProductPricing.css";

const ProductPricing = () => {

    const [asin, setAsin] = useState("");
    const [marketplaceId, setMarketplaceId] = useState("A21TJRUUN4KGV");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [pricing, setPricing] = useState(null);
    const [tableData, setTableData] = useState([]);

    const getPricing = async () => {

        if (!asin.trim()) {
            alert("Please enter ASIN");
            return;
        }

        setLoading(true);
        setError("");
        setPricing(null);

        try {

            const response = await axios.get(
                "http://localhost:5000/api/product-pricing",
                {
                    params: {
                        asin,
                        marketplaceId
                    }
                }
            );

            console.log(response.data);

            setPricing(response.data);

            setTableData([response.data]);

        } catch (err) {

            console.error(err);

            if (err.response) {
                setError(err.response.data.error || "API Error");
            } else {
                setError("Unable to connect to Flask API");
            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="pricing-container">

            <h2>Amazon Product Pricing (India)</h2>

            <div className="search-box">

                <div>

                    <label>Marketplace</label>

                    <select
                        value={marketplaceId}
                        onChange={(e) => setMarketplaceId(e.target.value)}
                    >

                        <option value="A21TJRUUN4KGV">
                            India
                        </option>

                    </select>

                </div>

                <div>

                    <label>ASIN</label>

                    <input
                        type="text"
                        placeholder="Enter ASIN"
                        value={asin}
                        onChange={(e) => setAsin(e.target.value)}
                    />

                </div>

                <button
                    onClick={getPricing}
                >
                    Get Pricing
                </button>

            </div>

            {loading &&

                <div className="loading">

                    Loading Pricing...

                </div>

            }

            {error &&

                <div className="error">

                    {error}

                </div>

            }

            {pricing &&

                <>

                    <div className="cards">

                        <div className="card">

                            <h4>ASIN</h4>

                            <p>{pricing.asin}</p>

                        </div>

                        <div className="card">

                            <h4>Marketplace</h4>

                            <p>{pricing.marketplace}</p>

                        </div>

                        <div className="card">

                            <h4>Listing Price</h4>

                            <p>

                                {pricing.currency}
                                {" "}
                                {pricing.listingPrice}

                            </p>

                        </div>

                        <div className="card">

                            <h4>Buy Box</h4>

                            <p>

                                {pricing.currency}
                                {" "}
                                {pricing.buyBoxPrice}

                            </p>

                        </div>

                        <div className="card">

                            <h4>Offers</h4>

                            <p>{pricing.offers}</p>

                        </div>

                    </div>

                    <table className="pricing-table">

                        <thead>

                            <tr>

                                <th>ASIN</th>

                                <th>Marketplace</th>

                                <th>Listing Price</th>

                                <th>Buy Box</th>

                                <th>Currency</th>

                                <th>Offers</th>

                                <th>Condition</th>

                            </tr>

                        </thead>

                        <tbody>

                            {tableData.map((item, index) => (

                                <tr key={index}>

                                    <td>{item.asin}</td>

                                    <td>{item.marketplace}</td>

                                    <td>{item.listingPrice}</td>

                                    <td>{item.buyBoxPrice}</td>

                                    <td>{item.currency}</td>

                                    <td>{item.offers}</td>

                                    <td>{item.condition}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </>

            }

        </div>

    );

};

export default ProductPricing;