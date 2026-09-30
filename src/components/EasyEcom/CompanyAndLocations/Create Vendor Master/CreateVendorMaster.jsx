import React, { useState } from "react";

const SERVER_URL = "http://localhost:5000";

const CreateVendorMaster = () => {
  const [form, setForm] = useState({
    emailId: "testvendor@gmail.com",
    firstName: "Testfirstname",
    lastName: "Testlastname",
    vendorCode: "145",
    companyName: "testcompany",
    taxIdentificationNum: "AP1423ED12W",
    street: "Kandivali",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400067",
    country: "India",
    contactNumber: "9876543210",
    currency: "INR",
  });

  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createVendor = async () => {
    setLoading(true);
    setError("");
    setResponseData(null);

    try {
      const requiredFields = [
        ["emailId", "Email ID"],
        ["firstName", "First Name"],
        ["lastName", "Last Name"],
        ["vendorCode", "Vendor Code"],
        ["companyName", "Company Name"],
        ["taxIdentificationNum", "Tax Identification Number"],
        ["street", "Street"],
        ["city", "City"],
        ["state", "State"],
        ["zip", "ZIP"],
        ["country", "Country"],
        ["contactNumber", "Contact Number"],
        ["currency", "Currency"],
      ];

      for (const [field, label] of requiredFields) {
        if (!String(form[field]).trim()) {
          throw new Error(`${label} is required`);
        }
      }

      const requestBody = {
        emailId: form.emailId,
        firstName: form.firstName,
        lastName: form.lastName,
        vendorCode: form.vendorCode,
        companyName: form.companyName,
        taxIdentificationNum:
          form.taxIdentificationNum,
        street: form.street,
        city: form.city,
        state: form.state,
        zip: Number(form.zip),
        country: form.country,
        contactNumber: form.contactNumber,
        currency: form.currency,
      };

      const response = await fetch(
        `${SERVER_URL}/api/wms/CreateVendor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create vendor"
        );
      }

      setResponseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm({
      emailId: "",
      firstName: "",
      lastName: "",
      vendorCode: "",
      companyName: "",
      taxIdentificationNum: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      contactNumber: "",
      currency: "INR",
    });

    setResponseData(null);
    setError("");
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const fieldStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>Create Vendor Master</h2>

      {/* Contact Information */}

      <h3>Vendor Information</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Email ID
        </label>

        <input
          type="email"
          name="emailId"
          value={form.emailId}
          onChange={handleChange}
          placeholder="testvendor@gmail.com"
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          First Name
        </label>

        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Last Name
        </label>

        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Vendor Code
        </label>

        <input
          type="text"
          name="vendorCode"
          value={form.vendorCode}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Company Name
        </label>

        <input
          type="text"
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Tax Identification Number
        </label>

        <input
          type="text"
          name="taxIdentificationNum"
          value={form.taxIdentificationNum}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Address */}

      <h3>Address</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Street
        </label>

        <input
          type="text"
          name="street"
          value={form.street}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          City
        </label>

        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          State
        </label>

        <input
          type="text"
          name="state"
          value={form.state}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          ZIP
        </label>

        <input
          type="number"
          name="zip"
          value={form.zip}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Country
        </label>

        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Other Details */}

      <h3>Other Details</h3>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Contact Number
        </label>

        <input
          type="text"
          name="contactNumber"
          value={form.contactNumber}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Currency
        </label>

        <input
          type="text"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* Buttons */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <button
          onClick={createVendor}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Vendor"}
        </button>

        <button
          onClick={clearForm}
          disabled={loading}
          style={{
            padding: "10px 18px",
            backgroundColor: "#777",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* Error */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            border: "1px solid #ef9a9a",
            borderRadius: "4px",
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
              padding: "15px",
              borderRadius: "5px",
              overflowX: "auto",
              border: "1px solid #ddd",
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

export default CreateVendorMaster;