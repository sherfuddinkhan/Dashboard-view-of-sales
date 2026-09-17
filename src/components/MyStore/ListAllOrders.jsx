import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const ListAllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${NODE_API}/mystore/orders`
            );

            setOrders(response.data?.data || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>MyStore - List All Orders</h2>

            <button onClick={getOrders}>
                Get Orders
            </button>

            {loading && <p>Loading...</p>}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <pre>
                {JSON.stringify(orders, null, 2)}
            </pre>
        </div>
    );
};

export default ListAllOrders;