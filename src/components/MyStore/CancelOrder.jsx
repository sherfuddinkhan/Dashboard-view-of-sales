import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const CancelOrder = () => {
    const [orderId, setOrderId] = useState(
        "651ea410db359c26e2c68aa1"
    );

    const [reason, setReason] = useState(
        "test Reason"
    );

    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const cancelOrder = async () => {
        try {
            setLoading(true);
            setError("");
            setResponse(null);

            const result = await axios.put(
                `${NODE_API}/mystore/orders/${orderId}/cancel`,
                {
                    reason
                }
            );

            setResponse(result.data);

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
            <h2>MyStore - Cancel Order</h2>

            <input
                value={orderId}
                onChange={(e) =>
                    setOrderId(e.target.value)
                }
                placeholder="Order ID"
            />

            <br />

            <input
                value={reason}
                onChange={(e) =>
                    setReason(e.target.value)
                }
                placeholder="Cancellation reason"
            />

            <br />

            <button
                onClick={cancelOrder}
                disabled={loading}
            >
                {loading
                    ? "Cancelling..."
                    : "Cancel Order"}
            </button>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <pre>
                {JSON.stringify(
                    response,
                    null,
                    2
                )}
            </pre>
        </div>
    );
};

export default CancelOrder;