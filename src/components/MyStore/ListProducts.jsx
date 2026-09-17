import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const ListProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${NODE_API}/mystore/products`
            );

            setProducts(
                response.data?.data || []
            );

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
            <h2>MyStore - Products</h2>

            <button onClick={getProducts}>
                Get Products
            </button>

            {loading && <p>Loading...</p>}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <pre>
                {JSON.stringify(
                    products,
                    null,
                    2
                )}
            </pre>
        </div>
    );
};

export default ListProducts;