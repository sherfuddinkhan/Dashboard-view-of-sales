import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const UpdateOrderAddress = () => {
  const [formData, setFormData] = useState({
    order_id: "206938289",
    shipping_name: "test",
    shipping_address_1: "C-404/4",
    shipping_address_2: "Navi Mumbai",
    shipping_city: "Mumbai",
    shipping_state_id: "15",
    shipping_country: "India",
    billing_name: "test",
    billing_address_1: "C-404/4",
    billing_address_2: "Navi Mumbai",
    billing_city: "Mumbai",
    billing_state_id: "15",
    billing_country: "India",
    billing_pin_code: "110022",
    billing_mobile: "9876543210",
  });

  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateOrderAddress = async () => {
    try {
      setLoading(true);
      setError("");
      setResponseData(null);

      const response = await fetch(
        `${SERVER_URL}/api/easyecom/orders/update-address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Update Order Address failed"
        );
      }

      setResponseData(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Update Order Address</h2>

      {Object.keys(formData).map((field) => (
        <div
          key={field}
          style={{
            marginBottom: "12px",
          }}
        >
          <label>{field}</label>
          <br />

          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            style={{
              width: "400px",
              padding: "8px",
            }}
          />
        </div>
      ))}

      <button
        onClick={updateOrderAddress}
        disabled={loading}
        style={{
          padding: "10px 20px",
        }}
      >
        {loading
          ? "Updating..."
          : "Update Order Address"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "20px",
            color: "red",
          }}
        >
          {error}
        </div>
      )}

      {responseData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(
              responseData,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UpdateOrderAddress;

