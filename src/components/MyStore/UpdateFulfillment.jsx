import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const statuses = [
    "Manifested",
    "Ready to ship",
    "Shipped",
    "In Transit",
    "Out For Delivery",
    "Delivered",
    "Returned",
    "Cancelled"
];

const UpdateFulfillment = () => {
    const [orderId, setOrderId] = useState(
        "63450b3478fcedff849e50a8"
    );

    const [trackingStatus, setTrackingStatus] =
        useState("Manifested");

    const [trackingNumber, setTrackingNumber] =
        useState("123456");

    const [trackingCompany, setTrackingCompany] =
        useState("Delhivery");

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const updateFulfillment = async () => {
        try {
            setError("");

            const result = await axios.put(
                `${NODE_API}/mystore/orders/${orderId}/fulfillment`,
                {
                    tracking_status: trackingStatus,
                    tracking_number: trackingNumber,
                    tracking_company: trackingCompany
                }
            );

            setResponse(result.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message
            );
        }
    };

    return (
        <div>
            <h2>MyStore - Update Fulfillment</h2>

            <input
                value={orderId}
                onChange={(e) =>
                    setOrderId(e.target.value)
                }
                placeholder="Order ID"
            />

            <br />

            <select
                value={trackingStatus}
                onChange={(e) =>
                    setTrackingStatus(e.target.value)
                }
            >
                {statuses.map((status) => (
                    <option
                        key={status}
                        value={status}
                    >
                        {status}
                    </option>
                ))}
            </select>

            <br />

            <input
                value={trackingNumber}
                onChange={(e) =>
                    setTrackingNumber(e.target.value)
                }
                placeholder="Tracking Number"
            />

            <br />

            <input
                value={trackingCompany}
                onChange={(e) =>
                    setTrackingCompany(e.target.value)
                }
                placeholder="Tracking Company"
            />

            <br />

            <button onClick={updateFulfillment}>
                Update Fulfillment
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

export default UpdateFulfillment;