import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const AdjustInventoryByProductId = () => {
    const [productId, setProductId] = useState(
        "64e72f84b652895bf2b90d87"
    );

    const [inventory, setInventory] =
        useState("170");

    const [comparePrice, setComparePrice] =
        useState("170");

    const [price, setPrice] = useState("170");

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const adjustInventory = async () => {
        try {
            setError("");

            const result = await axios.post(
                `${NODE_API}/mystore/inventory/product`,
                {
                    product_id: productId,
                    inventory_quantity:
                        Number(inventory),
                    compare_price:
                        Number(comparePrice),
                    price: Number(price)
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
                MyStore - Adjust Inventory By Product ID
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
                value={inventory}
                onChange={(e) =>
                    setInventory(e.target.value)
                }
                placeholder="Inventory Quantity"
            />

            <br />

            <input
                value={comparePrice}
                onChange={(e) =>
                    setComparePrice(e.target.value)
                }
                placeholder="Compare Price"
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

            <button onClick={adjustInventory}>
                Adjust Inventory
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

export default AdjustInventoryByProductId;