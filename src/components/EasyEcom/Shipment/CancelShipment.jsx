import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const CancelShipment = () => {
  const [form, setForm] = useState({
    awb: "",
    courier: "",

    username: "",
    password: "",
    token: "",
    account_no: "",
    service_type: "",
    eeApiToken: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/cancel-shipment`,
        form
      );

      setResponse(result.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to cancel shipment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Cancel Shipment</h2>

      <form onSubmit={handleSubmit}>
        <h3>AWB Details</h3>

        <div style={fieldStyle}>
          <label>AWB</label>

          <input
            type="text"
            name="awb"
            value={form.awb}
            onChange={handleChange}
            placeholder="abcd12345"
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Courier</label>

          <input
            type="text"
            name="courier"
            value={form.courier}
            onChange={handleChange}
            placeholder="xyz"
            required
            style={inputStyle}
          />
        </div>

        <h3>Carrier Credentials</h3>

        <div style={fieldStyle}>
          <label>Username</label>

          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Token</label>

          <input
            type="password"
            name="token"
            value={form.token}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Account No</label>

          <input
            type="text"
            name="account_no"
            value={form.account_no}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Service Type</label>

          <input
            type="text"
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>EasyEcom API Token</label>

          <input
            type="password"
            name="eeApiToken"
            value={form.eeApiToken}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Cancelling..." : "Cancel Shipment"}
        </button>
      </form>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong>
          <br />
          {error}
        </div>
      )}

      {response && (
        <div style={successStyle}>
          <h3>Response</h3>

          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: "700px",
  margin: "30px auto",
  padding: "25px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "#fff",
};

const fieldStyle = {
  marginBottom: "15px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 20px",
  cursor: "pointer",
};

const errorStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#ffe5e5",
};

const successStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#e8f5e9",
};

export default CancelShipment;