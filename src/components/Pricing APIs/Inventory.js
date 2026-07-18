import React, { useState } from "react";
import axios from "axios";

const Inventory = () => {

    const [marketplaceId, setMarketplaceId] = useState("A21TJRUUN4KGV");
    const [details, setDetails] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [summary, setSummary] = useState(null);
    const [inventory, setInventory] = useState([]);

    const getInventory = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await axios.get(
                "http://localhost:5000/api/inventory",
                {
                    params: {

                        marketplaceId,
                        details

                    }
                }
            );

            console.log(response.data);

            setSummary(response.data.summary);

            setInventory(response.data.inventory);

        }

        catch (err) {

            console.log(err);

            if (err.response) {

                setError(
                    err.response.data.error ||
                    "Unable to fetch inventory."
                );

            }
            else {

                setError("Node Server Not Running");

            }

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="inventory-container">

            <h2>Amazon Inventory Dashboard</h2>

            <div className="inventory-search">

                <div>

                    <label>

                        Marketplace

                    </label>

                    <select
                        value={marketplaceId}
                        onChange={(e) =>
                            setMarketplaceId(e.target.value)
                        }
                    >

                        <option value="A21TJRUUN4KGV">

                            India

                        </option>

                    </select>

                </div>

                <div>

                    <label>

                        Details

                    </label>

                    <select
                        value={details}
                        onChange={(e) =>
                            setDetails(e.target.value === "true")
                        }
                    >

                        <option value="true">

                            Yes

                        </option>

                        <option value="false">

                            No

                        </option>

                    </select>

                </div>

                <button
                    onClick={getInventory}
                >

                    Get Inventory

                </button>

            </div>

            {loading && (

                <div className="loading">

                    Loading Inventory...

                </div>

            )}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}

            {summary && (

                <div className="summary-cards">

                    <div className="card">

                        <h4>

                            Available

                        </h4>

                        <h2>

                            {summary.available}

                        </h2>

                    </div>

                    <div className="card">

                        <h4>

                            Reserved

                        </h4>

                        <h2>

                            {summary.reserved}

                        </h2>

                    </div>

                    <div className="card">

                        <h4>

                            Inbound

                        </h4>

                        <h2>

                            {summary.inbound}

                        </h2>

                    </div>

                    <div className="card">

                        <h4>

                            Researching

                        </h4>

                        <h2>

                            {summary.researching}

                        </h2>

                    </div>

                    <div className="card">

                        <h4>

                            Unfulfillable

                        </h4>

                        <h2>

                            {summary.unfulfillable}

                        </h2>

                    </div>

                </div>

            )}

            <table className="inventory-table">

                <thead>

                    <tr>

                        <th>ASIN</th>

                        <th>SKU</th>

                        <th>Condition</th>

                        <th>Available</th>

                        <th>Reserved</th>

                        <th>Inbound</th>

                        <th>Researching</th>

                        <th>Unfulfillable</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        inventory.map((item, index) => (

                            <tr key={index}>

                                <td>

                                    {item.asin}

                                </td>

                                <td>

                                    {item.sku}

                                </td>

                                <td>

                                    {item.condition}

                                </td>

                                <td>

                                    {item.available}

                                </td>

                                <td>

                                    {item.reserved}

                                </td>

                                <td>

                                    {item.inbound}

                                </td>

                                <td>

                                    {item.researching}

                                </td>

                                <td>

                                    {item.unfulfillable}

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

};

export default Inventory;