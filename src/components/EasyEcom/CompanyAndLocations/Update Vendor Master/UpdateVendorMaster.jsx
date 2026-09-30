import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const initialForm = {
  vendorId: "145",
  emailId: "updatevendor@gmail.com",
  firstName: "test",
  lastName: "doe",
  vendorCode: "",
  taxIdentificationNum: "",
  city: "Mumbai",
  state: "Maharashtra",
  contactNumber: "",
  daysToShip: "10",
};

const UpdateVendorMaster = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateVendor = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      if (!form.vendorId.trim()) {
        throw new Error("Vendor ID is required");
      }

      if (!form.emailId.trim()) {
        throw new Error("Email ID is required");
      }

      if (!form.firstName.trim()) {
        throw new Error("First name is required");
      }

      if (!form.lastName.trim()) {
        throw new Error("Last name is required");
      }

      if (!form.city.trim()) {
        throw new Error("City is required");
      }

      if (!form.state.trim()) {
        throw new Error("State is required");
      }

      if (!form.daysToShip.trim()) {
        throw new Error("Days to ship is required");
      }

      const payload = {
        vendorId: Number(form.vendorId),
        emailId: form.emailId.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        vendorCode: form.vendorCode,
        taxIdentificationNum:
          form.taxIdentificationNum,
        city: form.city.trim(),
        state: form.state.trim(),
        contactNumber: form.contactNumber,
        daysToShip: Number(form.daysToShip),
      };

      const response = await fetch(
        `${SERVER_URL}/api/wms/UpdateVendor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to update vendor master"
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Update Vendor Master Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while updating vendor"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(initialForm);
    setData(null);
    setError("");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Update Vendor Master</h2>

      <p style={{ color: "#666" }}>
        Update vendor information in EasyEcom.
      </p>

      {/* Vendor Information */}
      <div style={sectionStyle}>
        <h3>Vendor Information</h3>

        <div style={gridStyle}>
          <InputField
            label="Vendor ID"
            name="vendorId"
            type="number"
            value={form.vendorId}
            onChange={handleChange}
            placeholder="145"
          />

          <InputField
            label="Email ID"
            name="emailId"
            type="email"
            value={form.emailId}
            onChange={handleChange}
            placeholder="updatevendor@gmail.com"
          />

          <InputField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="test"
          />

          <InputField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="doe"
          />

          <InputField
            label="Vendor Code"
            name="vendorCode"
            value={form.vendorCode}
            onChange={handleChange}
            placeholder="Vendor code"
          />

          <InputField
            label="Tax Identification Number"
            name="taxIdentificationNum"
            value={form.taxIdentificationNum}
            onChange={handleChange}
            placeholder="Tax identification number"
          />
        </div>
      </div>

      {/* Address */}
      <div style={sectionStyle}>
        <h3>Address</h3>

        <div style={gridStyle}>
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Mumbai"
          />

          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Maharashtra"
          />
        </div>
      </div>

      {/* Other Details */}
      <div style={sectionStyle}>
        <h3>Other Details</h3>

        <div style={gridStyle}>
          <InputField
            label="Contact Number"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            placeholder="9876543210"
          />

          <InputField
            label="Days To Ship"
            name="daysToShip"
            type="number"
            value={form.daysToShip}
            onChange={handleChange}
            placeholder="10"
          />
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={updateVendor}
          disabled={loading}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            background: "#1976d2",
            color: "#fff",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "Update Vendor"}
        </button>

        <button
          type="button"
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            background: "#fdecea",
            color: "#b71c1c",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response */}
      {data && (
        <div>
          <h3>Response</h3>

          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: "500",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
};

const sectionStyle = {
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "20px",
  background: "#fafafa",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "15px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

export default UpdateVendorMaster;