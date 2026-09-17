import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetOrder = () => {
    const [orderId, setOrderId] = useState(
        "63450b3478fcedff849e50a9"
    );

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${NODE_API}/mystore/orders/${orderId}`
            );

            setOrder(response.data);

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
            <h2>MyStore - Get Individual Order</h2>

            <input
                value={orderId}
                onChange={(e) =>
                    setOrderId(e.target.value)
                }
                placeholder="Order ID"
            />

            <button onClick={getOrder}>
                Get Order
            </button>

            {loading && <p>Loading...</p>}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <pre>
                {JSON.stringify(order, null, 2)}
            </pre>
        </div>
    );
};

export default GetOrder;