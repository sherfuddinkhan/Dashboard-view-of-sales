import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const DeleteProduct = () => {
    const [productId, setProductId] = useState(
        "64906f89a89fdd6bb21fd8b3"
    );

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const deleteProduct = async () => {
        if (
            !window.confirm(
                "Are you sure you want to delete this product?"
            )
        ) {
            return;
        }

        try {
            setError("");

            const result = await axios.delete(
                `${NODE_API}/mystore/products/${productId}`
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
            <h2>
                MyStore - Delete Product
            </h2>

            <input
                value={productId}
                onChange={(e) =>
                    setProductId(e.target.value)
                }
                placeholder="Product ID"
            />

            <button onClick={deleteProduct}>
                Delete Product
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

export default DeleteProduct;