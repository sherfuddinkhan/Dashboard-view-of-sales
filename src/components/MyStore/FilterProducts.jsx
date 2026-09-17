import React, { useState } from "react";
import axios from "axios";

const NODE_API = "http://localhost:5000/api";

const FilterProducts = () => {
    const [field, setField] = useState("publish");
    const [operator, setOperator] =
        useState("equal");
    const [value, setValue] = useState("1");

    const [products, setProducts] = useState([]);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const filterProducts = async () => {
        try {
            setError("");

            let parsedValue = value;

            if (operator === "in") {
                parsedValue = value
                    .split(",")
                    .map((item) => item.trim());
            }

            const filters = [
                {
                    field,
                    value: parsedValue,
                    operator
                }
            ];

            const result = await axios.get(
                `${NODE_API}/mystore/products/filter`,
                {
                    params: {
                        filters:
                            JSON.stringify(filters)
                    }
                }
            );

            setResponse(result.data);

            setProducts(
                result.data?.data || []
            );

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
                MyStore - Filter Products
            </h2>

            <label>Field</label>

            <select
                value={field}
                onChange={(e) =>
                    setField(e.target.value)
                }
            >
                <option value="publish">
                    publish
                </option>

                <option value="categories">
                    categories
                </option>

                <option value="price">
                    price
                </option>
            </select>

            <br />

            <label>Operator</label>

            <select
                value={operator}
                onChange={(e) =>
                    setOperator(e.target.value)
                }
            >
                <option value="equal">
                    equal
                </option>

                <option value="not_equal">
                    not_equal
                </option>

                <option value="less_than">
                    less_than
                </option>

                <option value="greater_than">
                    greater_than
                </option>

                <option value="in">
                    in
                </option>
            </select>

            <br />

            <input
                value={value}
                onChange={(e) =>
                    setValue(e.target.value)
                }
                placeholder={
                    operator === "in"
                        ? "1,2,3"
                        : "Value"
                }
            />

            <br />

            <button onClick={filterProducts}>
                Filter Products
            </button>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <h3>
                Results: {products.length}
            </h3>

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

export default FilterProducts;