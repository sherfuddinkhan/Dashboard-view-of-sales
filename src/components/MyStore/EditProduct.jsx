import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const EditProduct = () => {
    const [productId, setProductId] = useState(
        "64906f89a89fdd6bb21fd8b3"
    );

    const [name, setName] = useState("Prod");
    const [price, setPrice] = useState("5000");
    const [inventory, setInventory] =
        useState("100");

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const editProduct = async () => {
        try {
            setError("");

            const result = await axios.put(
                `${NODE_API}/mystore/products/${productId}`,
                {
                    name,
                    price,
                    inventory_quantity: inventory
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
            <h2>
                MyStore - Edit Product
            </h2>

            <input
                value={productId}
                onChange={(e) =>
                    setProductId(e.target.value)
                }
                placeholder="Product ID"
            />

            <br />

            <input
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
                placeholder="Name"
            />

            <br />

            <input
                value={price}
                onChange={(e) =>
                    setPrice(e.target.value)
                }
                placeholder="Price"
            />

            <br />

            <input
                value={inventory}
                onChange={(e) =>
                    setInventory(e.target.value)
                }
                placeholder="Inventory"
            />

            <br />

            <button onClick={editProduct}>
                Edit Product
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

export default EditProduct;