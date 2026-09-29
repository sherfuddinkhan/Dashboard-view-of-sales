
import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const GetOrderCount = () => {
  const [form, setForm] = useState({
    order_start_date: "2022-03-01 00:00:00",
    order_end_date: "2022-03-10 00:00:00",
    invoice_start_date: "2022-03-01 00:00:00",
    invoice_end_date: "2022-03-10 00:00:00",
    updated_after: "2022-03-01 00:00:00",
    updated_before: "2022-03-10 00:00:00",
    marketplace_id: "8",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getOrderCount = async () => {
    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const params = new URLSearchParams();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") {
          params.append(key, value);
        }
      });

      const res = await fetch(
        `${SERVER_URL}/api/easyecom/orders/count?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to get order count"
        );
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Get Order Count</h2>

      {Object.keys(form).map((field) => (
        <div key={field} style={{ marginBottom: "12px" }}>
          <label>
            {field}
          </label>
          <br />

          <input
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            style={{
              width: "350px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <button onClick={getOrderCount} disabled={loading}>
        {loading ? "Loading..." : "Get Order Count"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          {error}
        </div>
      )}

      {response && (
        <pre
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default GetOrderCount;

