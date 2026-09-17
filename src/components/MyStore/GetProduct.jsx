import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const GetProduct = () => {
    const [productId, setProductId] = useState(
        "648ac976ba3afb8754861204"
    );

    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");

    const getProduct = async () => {
        try {
            setError("");

            const response = await axios.get(
                `${NODE_API}/mystore/products/${productId}`
            );

            setProduct(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message
            );
        }
    };

    return (
        <div>
            <h2>
                MyStore - Get Particular Product
            </h2>

            <input
                value={productId}
                onChange={(e) =>
                    setProductId(e.target.value)
                }
                placeholder="Product ID"
            />

            <button onClick={getProduct}>
                Get Product
            </button>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <pre>
                {JSON.stringify(
                    product,
                    null,
                    2
                )}
            </pre>
        </div>
    );
};

export default GetProduct;