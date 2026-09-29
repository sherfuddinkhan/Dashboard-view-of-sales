import React, { useState } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

const Authenticate = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    token: "",
    account_no: "",
    service_type: "",
    eeApiToken: "",
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResponse(null);
    setError("");

    try {
      const result = await axios.post(
        `${SERVER_URL}/api/easyecom/authenticate`,
        form
      );

      setResponse(result.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message
      );
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Carrier Authentication</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Token</label>
          <input
            type="text"
            name="token"
            value={form.token}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Account No</label>
          <input
            type="text"
            name="account_no"
            value={form.account_no}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Service Type</label>
          <input
            type="text"
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>EasyEcom API Token</label>
          <input
            type="text"
            name="eeApiToken"
            value={form.eeApiToken}
            onChange={handleChange}
            placeholder="email, password, location_key"
          />
        </div>

        <button type="submit" style={{ marginTop: 20 }}>
          Authenticate
        </button>
      </form>

      {error && (
        <pre style={{ color: "red", marginTop: 20 }}>
          {error}
        </pre>
      )}

      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>Authentication Response</h3>
          <pre>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Authenticate;