import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const AddUser = () => {
  const [formData, setFormData] = useState({
    roleTypeId: 2,
    email: "testapiuser@gmail.com",
    password: "abcd1234",
    firstname: "TestUserapi",
    lastname: "Test lastname of user",
  });

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "roleTypeId" ? Number(value) : value,
    }));
  };

  const addUser = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to add user"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      roleTypeId: 2,
      email: "",
      password: "",
      firstname: "",
      lastname: "",
    });

    setResponseData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Add User</h2>

      <form onSubmit={addUser}>
        {/* Role Type ID */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Role Type ID
          </label>

          <input
            type="number"
            name="roleTypeId"
            value={formData.roleTypeId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Password
          </label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* First Name */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            First Name
          </label>

          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Last Name */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
            }}
          >
            Last Name
          </label>

          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              marginRight: "10px",
            }}
          >
            {loading ? "Adding..." : "Add User"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            style={{
              padding: "10px 20px",
              backgroundColor: "#777",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {responseData && (
        <div style={{ marginTop: "25px" }}>
          <h3>Response</h3>

          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
            }}
          >
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AddUser;