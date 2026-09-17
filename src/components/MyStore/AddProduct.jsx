import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const AddProduct = () => {
    const [form, setForm] = useState({
        name: "newProduct",
        price: "500",
        compare_price: "1000",
        categories: "fashion",
        inventory_quantity: "10",
        location_availability_mode:
            "zip_codes",
        zip_codes: "122050,171010",
        country_of_origin: "IN",
        net_quantity: "100"
    });

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const update = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const addProduct = async () => {
        try {
            setError("");

            const body = {
                name: form.name,
                price: form.price,
                compare_price:
                    form.compare_price,

                categories: [
                    form.categories
                ],

                inventory_quantity:
                    form.inventory_quantity,

                location_availability_mode:
                    form.location_availability_mode,

                zip_codes:
                    form.zip_codes
                        .split(",")
                        .map((x) => x.trim()),

                country_of_origin:
                    form.country_of_origin,

                net_quantity:
                    form.net_quantity,

                options: [
                    {
                        name: "size",
                        values: ["s", "xs"]
                    },
                    {
                        name: "color",
                        values: ["blue", "white"]
                    }
                ],

                variants: [
                    {
                        options: [
                            {
                                name: "color",
                                value: "white"
                            },
                            {
                                name: "size",
                                value: "s"
                            }
                        ],
                        price: "100",
                        variant_id: "white|s",
                        inventory_quantity: "10"
                    },

                    {
                        options: [
                            {
                                name: "color",
                                value: "white"
                            },
                            {
                                name: "size",
                                value: "xs"
                            }
                        ],
                        price: "100",
                        variant_id: "white|xs",
                        inventory_quantity: "10"
                    },

                    {
                        options: [
                            {
                                name: "color",
                                value: "blue"
                            },
                            {
                                name: "size",
                                value: "s"
                            }
                        ],
                        price: "100",
                        variant_id: "blue|s",
                        inventory_quantity: "10"
                    },

                    {
                        options: [
                            {
                                name: "color",
                                value: "blue"
                            },
                            {
                                name: "size",
                                value: "xs"
                            }
                        ],
                        price: "100",
                        variant_id: "blue|xs",
                        inventory_quantity: "10"
                    }
                ],

                images: [
                    {
                        image: {
                            type: "image/png",
                            uploadType: "url",
                            name: "new Image",
                            data:
                                "https://cdn.pixabay.com/photo/2022/01/11/21/48/link-6931554_960_720.png"
                        }
                    }
                ]
            };

            const result = await axios.post(
                `${NODE_API}/mystore/products`,
                body
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
                MyStore - Add Product With Variants
            </h2>

            <input
                value={form.name}
                onChange={(e) =>
                    update("name", e.target.value)
                }
                placeholder="Product Name"
            />

            <br />

            <input
                value={form.price}
                onChange={(e) =>
                    update("price", e.target.value)
                }
                placeholder="Price"
            />

            <br />

            <input
                value={form.compare_price}
                onChange={(e) =>
                    update(
                        "compare_price",
                        e.target.value
                    )
                }
                placeholder="Compare Price"
            />

            <br />

            <input
                value={form.categories}
                onChange={(e) =>
                    update(
                        "categories",
                        e.target.value
                    )
                }
                placeholder="Category"
            />

            <br />

            <input
                value={form.inventory_quantity}
                onChange={(e) =>
                    update(
                        "inventory_quantity",
                        e.target.value
                    )
                }
                placeholder="Inventory"
            />

            <br />

            <button onClick={addProduct}>
                Add Product
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

export default AddProduct;